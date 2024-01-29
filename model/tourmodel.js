const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./userModel');
//creating a schema
const tourschema = new mongoose.Schema(
  {
    //basic declaration with there type
    // name: String,
    // rating: Number,
    // price: Number,

    //if we want to mention other things to like default value , type ,required , unique etc
    //we have to create an object for that

    name: {
      type: String,
      //require : array of [ true , error]
      require: [true, ' a tour must have an name'],
      unique: true,
    },
    duration: {
      type: Number,
      require: [true, 'A tour must have an duration'],
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'A tour must have an maxgroupsize'],
    },
    difficulty: {
      type: String,
      require: [true, 'A tour must have an difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either:easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1.0'],
      max: [1, 'rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //ex  4.666 , 46.66,47,4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      require: [true, ' a tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      require: [true, 'a tour must have a summary'],
      trim: true, //removes whitesp[aces from the begining an the end
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//indexing
tourschema.index({ price: 1, ratingsAverage: -1 });
tourschema.index({ slug: 1 });
tourschema.index({
  startLocation: '2dsphere',
});
//creating virtual properties
tourschema.virtual('durationweeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourschema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//populating middleware
tourschema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v,-passwordChangedAt',
  });
  next();
});

// //embedding
// tourschema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//document middleware :runs before .save() and .create not for insertmany()
// tourschema.pre('save', function (next) {
//   console.log('will save document');
//   next();
// });

// tourschema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// creating a model based on schema
const Tour = mongoose.model('Tour', tourschema);

module.exports = Tour;
