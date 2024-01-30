const AppError = require('../utils/AppError');
const User = require('./../model/userModel');
const CatchAsync = require('./../utils/CatchAsync');
const Factory = require('./../controller/handleFactory');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/users');
  },
  filename: function (req, file, cb) {
    //users-user.id-timestamp.jpg
    const endSuffix = file.mimetype.split('/')[1];
    const UniqueName = `user-${req.user.id}-${Date.now()}.${endSuffix}`;
    cb(null, UniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image!please upload only image', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.updateMe = CatchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  //1)create an error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password updates ,please use /updatePassword',
        400
      )
    );
  }
  //2)filter the body
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;

  //3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = CatchAsync(async (req, res, next) => {
  // console.log(req.user, 'user');

  const deletedUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  // console.log(deletedUser);

  res.status(204).json({
    status: 'sucess',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.GetUser = Factory.getOne(User);
exports.GetAllUsers = Factory.GetAll(User);

//create user
exports.CreateUser = Factory.CreateOne(User);

//do not update password
exports.UpdateUser = Factory.updateOne(User);
exports.DeleteUser = Factory.deleteOne(User);
