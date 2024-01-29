const { model } = require('mongoose');
const CatchAsync = require('../utils/CatchAsync');
const AppError = require('./../utils/AppError');
const APIFeatures = require('./../utils/apiFeatures');

//deleting
exports.deleteOne = (model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`no tour found for this ${req.params.id} id`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

//updating

exports.updateOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    if (req.files) console.log(req.files);
    console.log(req.body);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(`no tour found for this ${req.params.id} id`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//create
exports.CreateOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  CatchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(`no document found for this ${req.params.id} id`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.GetAll = (Model) =>
  CatchAsync(async (req, res, next) => {
    //executre query
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();

    // const doc = await features.query.explain(); //.explain() function is used to explain the whole document proceesed
    const doc = await features.query;

    res.status(200).json({
      status: 'success', //status can be succes or fail
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
