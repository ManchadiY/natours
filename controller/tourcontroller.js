const { query } = require('express');
const Tour = require('./../model/tourmodel');
const APIFeatures = require('./../utils/apiFeatures');
const CatchAsync = require('./../utils/CatchAsync');
const AppError = require('../utils/AppError');
const Factory = require('./../controller/handleFactory');
const multer = require('multer');
//reading the tours.json file and convertting it into js object
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.CheckId = (req, res, next, val) => {
//   console.log(`tour id :${val}`);
//   if (req.params.id * 1 > tours.length) {
//     // if id  not found
//     return res.status(404).json({
//       status: 'failed',
//       message: 'invalid Id',
//     });
//   }
//   next();
// };

// exports.CheckBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'price or name missing',
//     });
//   }
//   next();
// };

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/tours');
  },
  filename: function (req, file, cb) {
    //users-user.id-timestamp.jpg
    const endSuffix = file.mimetype.split('/')[1];
    const UniqueName = `tour-${req.user.id}-${Date.now()}.${endSuffix}`;
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

//
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.TourImages = (req, res, next) => {
  if (!req.files) return next();
  console.log('inside tourimages');

  //1)imageCover
  req.body.imageCover = req.files.imageCover[0].filename;
  console.log(req.body.imageCover);

  //2)images
  req.body.images = [];
  req.files.images.map((el) => {
    req.body.images.push(el.filename);
  });
  next();
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name,price,ratingsAverage,difficulty';
  next();
};

// exports.GetAllTours = CatchAsync(async (req, res, next) => {
//   //QUERY
//   // //1)FILTERING
//   // let queryObj = { ...req.query }; // store obj in variable destructing way
//   // // console.log(req.query);
//   // // console.log(queryObj);
//   // let excludedField = ['page', 'sort', 'limit', 'fields'];
//   // excludedField.forEach((el) => delete queryObj[el]);
//   // // console.log(req.query, queryObj);

//   // //1B)ADVANCE FILTERING
//   // //{duration : {$lte : '7'}}  //query
//   // //{duration: { lte: '7' } }  //response query
//   // //how we have to change resquery to a query so that it can filter

//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => {
//   //   return `$${match}`;
//   // });
//   // // console.log(JSON.parse(queryStr));

//   // let query = Tour.find(JSON.parse(queryStr));

//   //SORTING
//   // if (req.query.sort) {
//   //   const DataSort = req.query.sort.split(',').join(' ');
//   //   query = query.sort(DataSort);
//   // } else {
//   //   query = query.sort('-createdAt');
//   // }

//   // //field limiting
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   console.log(fields);
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v');
//   // }

//   // //PAGINATION
//   // const page = req.query.page * 1 || 1; //or can be used to define default
//   // const limit = req.query.limit * 1 || 100; //multiply by 1 is used to convert a string into a number
//   // const skip = (page - 1) * limit;

//   // //Page=2&limit=10 pg 1 1-10 ,pg2 11-20

//   // if (req.query.page) {
//   //   const NumTour = await tours.countDocuments();
//   //   if (skip > NumTour) throw new Error('this page does not exist');
//   // }

//   // query = query.skip(skip).limit(limit);

//   //executre query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitField()
//     .paginate();

//   const tours = await features.query;
//   res.status(200).json({
//     status: 'success', //status can be succes or fail
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

//handle factory for get all tours
exports.GetAllTours = Factory.GetAll(Tour);

//handle factory for create tour
exports.CreateTour = Factory.CreateOne(Tour);

//console.log(req.body);
// const NewId = tours[tours.length - 1].id + 1;
// const NewTours = Object.assign({ id: NewId }, req.body);
// tours.push(NewTours);

// fs.writeFile(
//   `${__dirname}/../dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tours: NewTours,
//       },
//     });
//   }
// );
//res.send('done');
//};

//handle factory for get tour
exports.GetTour = Factory.getOne(Tour, { path: 'reviews' });

// exports.GetTour = CatchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(
//       new AppError(`no tour found for this ${req.params.id} id`, 404)
//     );
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours: tour,
//     },
//   });
// console.log(req.params); //paramters eg id or we can say variables in url (:)
// const id = req.params.id * 1; //converting string into a number
// const tour = tours.find((el) => el.id === id); // finding wheter the id is present or not
// if (!tour) {
//   // if id  not found
//   return res.status(404).json({
//     status: 'failed',
//     message: 'invalid Id',
//   });
// }
// // if id is present
// res.status(200).json({
//   status: 'success',
//   data: {
//     tours: tour,
//   },
// });
// });

exports.updateTour = Factory.updateOne(Tour);

exports.DeleteTour = Factory.deleteOne(Tour);

exports.getTourStats = CatchAsync(async (req, res, next) => {
  console.log('hiii');

  const stats = await Tour.aggregate([
    {
      $match: { price: { $gte: 400 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxprice: { $max: '$price' },
      },
    },

    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.GetMonthlyPlan = CatchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: `$name` },
      },
    },
    {
      $addFields: {
        month: `$_id`,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

//'/tours-within/:distance/center/:latlng/unit/:unit'
// '/tours-within/:200/center/:40,-45/unit/:mi'

exports.getToursWithin = CatchAsync(async (req, res, next) => {
  console.log('hiiii');
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  console.log(lat);
  console.log(lng);
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// /distances/:latlng/unit/:unit
// distances/34.075285,-118.185305/unit/mi

exports.getDistances = CatchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === mi ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
