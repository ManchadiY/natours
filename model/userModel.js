const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//create a schema conatining name,email,photo,pasword,passwordconfirm

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a user must have a name '],
  },
  email: {
    type: String,
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true, //converts the string into lowercase
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false, // this will help to not show password to the user or this field will not be displayed
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      //this only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not same!',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordChangedAt: Date,
  passwordResetToken: {
    type: String,
  },
  passwordResetExpire: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

UserSchema.pre('save', async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //hash the password with cost of 12 (we can increase or decreasde the cost)
  this.password = await bcrypt.hash(this.password, 12);

  //after the above validation we dont need  the confirm password
  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userpassword
) {
  return await bcrypt.compare(candidatePassword, userpassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimeStamp);

    return JWTTimeStamp < changedTimestamp; //100 <200
  }

  return false;
};

UserSchema.methods.createPasswordRestToken = function () {
  const ResetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(ResetToken)
    .digest('hex');

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return ResetToken;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
