const mongoose = require('mongoose');
const User = require('./userModel');
const Tour = require('./tourmodel');

//review//rating/createdAt/ref to tour/ref to user
const reviewschema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      //required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      //required: [true, 'Review must belong to user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//preventing devulicate review
reviewschema.index({ tour: 1, user: 1 }, { unique: true });

//populating
reviewschema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name',
  //   });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// // Statics are pretty much the same as methods but allow
// //for defining functions that exist directly on your Model
// reviewschema.statics.calcAverageRatings = async function (tourId) {
//   console.log(tourId);
//   const stats = await this.aggregate([
//     {
//       $match: { tour: tourId },
//     },
//     {
//       $group: {
//         _id: '$tour',
//         nRating: { $sum: 1 },
//         avgRating: { $avg: '$rating' },
//       },
//     },
//   ]);
// };

// reviewschema.post('save', function () {
//   //this points to cuurent review therefore we user
//   console.log(this.constructor , this.tour);
//   this.constructor.calcAverageRatings(this.tour);
// });

reviewschema.statics.calcAverageRatings = async function (tourId) {
  //this keyword points to current model which in our case is tour
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};

reviewschema.post('save', function () {
  //this poinys to current review
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete

reviewschema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(r);
});

//pass from pre middleware to post middleware
reviewschema.post(/^findOneAnd/, async function () {
  //await this.findone() cant work here as its already be executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

//creation of model mongoose.model('modelname',model)
const Review = mongoose.model('Review', reviewschema);

module.exports = Review;
