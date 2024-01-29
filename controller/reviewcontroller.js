const Review = require('./../model/reviewModel');
const CatchAsync = require('./../utils/CatchAsync');
const AppError = require('../utils/AppError');
const Factory = require('./../controller/handleFactory');

// exports.getAllReviews = CatchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const review = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     results: review.length,
//     data: {
//       review,
//     },
//   });
// });
//handle for get all reviews even query can be applied on it
exports.getAllReviews = Factory.GetAll(Review);

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getReview = Factory.getOne(Review);
exports.createReview = Factory.CreateOne(Review);

exports.deleteReview = Factory.deleteOne(Review);
exports.updateReview = Factory.updateOne(Review);
