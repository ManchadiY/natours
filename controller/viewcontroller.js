const Tour = require('../model/tourmodel');
const AppError = require('../utils/AppError');
const CatchAsync = require('../utils/CatchAsync');

exports.getOverview = CatchAsync(async (req, res) => {
  //1) get tour data from collection
  const tours = await Tour.find();
  //2)build template

  //3)render that template using tour data from 1)
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js 'unsafe-inline' 'unsafe-eval';"
    )
    .render('overview', {
      title: 'All tours',
      tours: tours,
    });
});

exports.getTour = CatchAsync(async (req, res, next) => {
  //1)get the data for the requested tour(including reviews and guides)
  const tour = await Tour.findById(req.params.id).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There id no tour with that name.', 400));
  }

  //2)build the template
  //3)render the data using 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour,
  });
});

exports.getLoginForm = CatchAsync(async (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js 'unsafe-inline' 'unsafe-eval';"
    )
    .render('login', {
      title: 'Log into your account',
    });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getSignupForm = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js 'unsafe-inline' 'unsafe-eval';"
    )
    .render('signup', {
      title: 'Signup',
    });
};
