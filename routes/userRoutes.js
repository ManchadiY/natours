const express = require('express');

const UerController = require('./../controller/usercontroller');
const authController = require('./../controller/authcontroller');
const reviewcontroller = require('./../controller/reviewcontroller');

const Routes = express.Router();

Routes.post('/signup', authController.singup);
Routes.post('/login', authController.login);
Routes.get('/logout', authController.logout);

Routes.post('/forgotPassword', authController.forgotPassword);
Routes.patch('/resetPassword/:token', authController.resetPassword);

//create user
Routes.post('/', UerController.CreateUser);

//middleware used for authentication
//protect all routes after this
Routes.use(authController.protect);

Routes.patch('/updatePassword', authController.updatePassword);

//upload.single('fieldName')
Routes.patch(
  '/updateMe',
  authController.protect,
  UerController.uploadUserPhoto,
  UerController.updateMe
);
Routes.delete('/deleteMe', UerController.deleteMe);
Routes.get('/me', UerController.getMe, UerController.GetUser);

//restrict all the routes after this middleware to admin,guuide
Routes.use(authController.restrictTo('admin, lead-guide,guide'));

Routes.route('/').get(UerController.GetAllUsers);
Routes.route('/:id')
  .get(UerController.GetUser)
  .patch(UerController.UpdateUser)
  .delete(UerController.DeleteUser);

module.exports = Routes;
