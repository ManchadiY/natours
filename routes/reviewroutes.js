const express = require('express');
const Routes = express.Router({ mergeParams: true });
const authController = require('./../controller/authcontroller');
const ReviewController = require('./../controller/reviewcontroller');

//POST /tour/234fad4/reviews

Routes.use(authController.protect);
Routes.route('/')
  .get(ReviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    ReviewController.setTourUserIds,
    ReviewController.createReview
  );
Routes.route('/:id')
  .get(ReviewController.getReview)
  .patch(ReviewController.updateReview)
  .delete(
    authController.restrictTo('user,admin'),
    ReviewController.deleteReview
  )
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    ReviewController.setTourUserIds,
    ReviewController.createReview
  );

module.exports = Routes;
