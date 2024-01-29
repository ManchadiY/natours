const express = require('express');

const TourController = require('./../controller/tourcontroller');
const authController = require('./../controller/authcontroller');
const ReviewController = require('./../controller/reviewcontroller');
const review = require('./reviewroutes');
const Routes = express.Router();

//param middleware

// Routes.param('id', TourController.CheckId);

//nested route
//POST /tour/234fad4/reviews
//GET /tour/234fad4/reviews/94887fda

// Routes.route('/:tourId/reviews').post(
//   authController.protect,
//   authController.restrictTo('user'),
//   ReviewController.createReview
// );

//redirecting (nested)
Routes.use('/:tourId/reviews', review);

//
Routes.route('/top-5-tours').get(
  TourController.aliasTopTours,
  TourController.GetAllTours
);

Routes.route('/tour-stats').get(TourController.getTourStats);
Routes.route('/Monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  TourController.GetMonthlyPlan
);

Routes.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  TourController.getToursWithin
);

Routes.route('/distances/:latlng/unit/:unit').get(TourController.getDistances);

Routes.route('/')
  .get(TourController.GetAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    TourController.CreateTour
  );
Routes.route('/:id')
  .get(TourController.GetTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    TourController.uploadTourImages,
    TourController.TourImages,
    TourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    TourController.DeleteTour
  );

module.exports = Routes;
