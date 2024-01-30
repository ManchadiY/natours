const path = require('path');
const express = require('express'); //express module
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/AppError'); //error class
const GlobalErrorHandler = require('./controller/Errorcontroller'); //global error handler

const TourRoutes = require('./routes/tourRoutes');
const UserRoutes = require('./routes/userRoutes');
const ReviewRoutes = require('./routes/reviewroutes');
const viewRouter = require('./routes/viewroutes');
const bookingRouter = require('./routes/bookingRoutes');
const cookieParser = require('cookie-parser');
const app = express(); //adding it into the app variable

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//static template url
app.use(express.static(`${__dirname}/public`));

const morgan = require('morgan');

//1) middleware

//
app.use(helmet());

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  //console.log(process.env.NODE_ENV);
}

//limit request from same api
const limiter = rateLimit({
  max: 100, //100 req per hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour',
});
app.use('/api', limiter);

//body parser,reading data from body into req.body
app.use(express.json()); //middleware used between req and res in post http

//cookie-parser
app.use(cookieParser());

//data sanitization against NoSQL query injection
app.use(mongoSanitize());

//datra sanitization against xss
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// app.get('/', (req, res) => {
//   res.status(200).send('hello from the server');
// });
// app.post('/', (req, res) => {
//   res.status(200).send('you can now post ');
// });

//creating own middleware
// app.use((req, res, next) => {
//   console.log('hello from the middleware');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  console.log(req.cookies);
  next();
});

// //create a gettours request
// app.get('/api/v1/tours', GetAllTours);
// //create a post tour request
// app.post('/api/v1/tours', PostTour);
// //create gettour for particular id
// app.get('/api/v1/tours/:id', GetTour);

// //creating a patch request
// app.patch('/api/v1/tours/:id', updateTour);

// //create a delete request
// app.delete('/api/v1/tours/:id', DeleteTour);

//tour routes
//creating middleware for particular route

//routes
app.use('/', viewRouter);
app.use('/api/v1/tours', TourRoutes);
//user routes
app.use('/api/v1/users', UserRoutes);
//review routes
app.use('/api/v1/reviews', ReviewRoutes);
//booking routes
// app.use('/api/v1/booking', bookingRouter);

// handling unhandled routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `cant find ${req.originalUrl} on the server`,
  // });

  // const err = new Error(`cant find ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`cant find ${req.originalUrl} on the server`, 404));
});

app.use(GlobalErrorHandler);

module.exports = app;
