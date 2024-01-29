const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');
const CatchAsync = require('./../utils/CatchAsync');
const AppError = require('./../utils/AppError');
const Email = require('./../utils/email');
const crypto = require('crypto');
const { url } = require('inspector');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined; //to not display the password in the output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.singup = CatchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);

  await new Email(newUser, url).sendWelcome();

  //jwt.sign(payload, secretOrPrivateKey, [options, callback])
  //PAYLOAD is data ,secret is jwtsecret ,OPTION CAN BE EXPIRE TIME

  // const token = signToken(newUser._id);
  // // //he HTTP 201 Created success status response code indicates,
  // // // that the request has succeeded and has led to the creation of a resource.
  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
  createSendToken(newUser, 201, res);

  // createSendToken(newUser, 201, res);
});

//only for rendered pages,no errors
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //console.log(decoded);

      //2)check if user still exists
      const freshUser = await User.findById(decoded.id);
      console.log(freshUser);
      if (!freshUser) {
        return next();
      }

      //4) check if user changed password after the token was issued
      if (freshUser.changedPasswordAfter(decoded.id)) {
        return next();
      }

      //there is a logged in user
      res.locals.user = freshUser; // pug template will have acess to res.locals
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

exports.login = CatchAsync(async (req, res, next) => {
  //destructing the req.body to get email and password

  const { email, password } = req.body;

  //1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password ', 400));
  }

  //2)check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  console.log(user);

  const confirm = await user.correctPassword(password, user.password);

  if (!user || !confirm) {
    return next(new AppError('incorrect user or password', 401));
  }
  //401 means unauthorized

  //3)if everything is okay send token to the client
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  // res.cookie('jwt', token, cookieOptions);
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = CatchAsync(async (req, res, next) => {
  //1)getting token and check of its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //console.log(token);
  //check token if is there
  if (!token) {
    return next(new AppError('you are not logged in! please login', 401));
  }

  //2)verification toke
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3)check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('user belonging to this token does no longer exist', 401)
    );
  }

  //4) check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.id)) {
    return next(
      new AppError('user recently changed password!please login again', 401)
    );
  }

  //grand acceess
  res.locals.user = freshUser;
  req.user = freshUser;
  //console.log(req.user);
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not ave permission to perform this action', 403)
      );
    }
    next();
  };
};

//sendEmail is not defined note
exports.forgotPassword = CatchAsync(async (req, res, next) => {
  //console.log('hello');
  //1)get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this email address', 404));
  }

  //2)generate the random reset token
  const resetToken = user.createPasswordRestToken();
  await user.save({ validateBeforeSave: false });

  try {
    // await sendEmail({
    //   email: req.body.email,
    //   subject: 'your password reset token valid for 10mins ',
    //   message,
    // });

    //3)send it to users email
    const restURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, restURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token send to email',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email.try again later', 500)
    );
  }
});

exports.resetPassword = async (req, res, next) => {
  // 1)get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gte: Date.now() },
  });

  //2)if the token has not expired and there is user set the new password
  if (!user) {
    return next(new AppError('token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  //3) update chnagedpasswordat property for the user

  //4) log the user in send jwt
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
};

exports.updatePassword = CatchAsync(async (req, res, next) => {
  //1)get user from collection
  const user = await User.findById(req.user.id).select('+password');
  console.log(user);
  //2)check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('inavlid user password ', 400));
  }
  //3)if so,update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4)log user in,send jwt
  createSendToken(user, 200, res);
});
