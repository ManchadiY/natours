const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `inavlid ${err.path} : ${err.value}`;

  return new AppError(message, 400);
};
const handleDublicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `dublicate field value ${value} ,please use another value `;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('invalid token.please login again', 401);

const handleTokenExpiredError = () =>
  new AppError('your token has been expired! please login again', 401);

const SendErrorDev = (err, req, res) => {
  //api
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //rendered website
    //render('title',optionaldata or localstorage)
    res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      message: err.message,
    });
  }
};

const SendErrorProd = (err, req, res) => {
  //operational ,trusted error:send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      //programming or other unknown error:dont leak error details
      //log error
      console.error('ERROR', err);
      //send generate message
      res.status(500).json({
        status: 'error',
        message: 'something went very wrong',
      });
    }
  } else {
    //for rendered websites
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      //programming or other unknown error:dont leak error details
      //log error
      console.error('ERROR', err);
      //send generate message
      res.status(err.statusCode).render('error', {
        title: 'something went wrong',
        message: 'please try again later',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    SendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 11000) error = handleDublicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name == 'JsonWebTokenError') error = handleJWTError();
    if (error.name == 'TokenExpiredError') error = handleTokenExpiredError();
    SendErrorProd(error, req, res);
  }
};
