const uuid = require("uuid");
const fs = require("fs");
const HttpError = require("../Models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../Models/place");
const User = require("../Models/user");
const mongoose = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const { pid } = req.params;
  let place;
  try {
    place = await Place.findById(pid);
  } catch (e) {
    const err = new HttpError(
      "Something went wrong. could not find a place.",
      500
    );
    return next(err);
  }
  if (!place) {
    const err = new HttpError("Could not find place for the provided id", 404);
    return next(err);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const { uid } = req.params;
  // let places;
  let userWithPlaces;
  try {
    // places = await Place.find({ creator: uid });
    userWithPlaces = await User.findById(uid).populate("places");
  } catch (e) {
    const err = new HttpError(
      "Something went wrong. could not find a place.",
      500
    );
    return next(err);
  }
  //  if(!places || places.length)
  if (!userWithPlaces || !userWithPlaces.places.length) {
    return next(
      new HttpError("Could not find places for the provided user id", 404)
    );
  }
  places = userWithPlaces.places.map((place) => {
    return place.toObject({ getters: true });
  });
  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (e) {
    return next(e);
  }
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });
  let user;
  try {
    user = await User.findById(req.userData.userId);
    if (!user) {
      const err = new HttpError("Could not find user for provided id .", 404);
      return next(err);
    }
  } catch (e) {
    const err = new HttpError("creating place failed, please try again.", 500);
    return next(err);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    console.log(e);
    const err = new HttpError("creating place failed, please try again.", 500);
    return next(err);
  }
  res.status(201).json({ pleace: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const { pid } = req.params;
  const { title, description } = req.body;

  let place;
  try {
    place = await Place.findById(pid);
  } catch (e) {
    const err = new HttpError(
      "something went wrong. could not update place.",
      500
    );
    return next(err);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const err = new HttpError("You are not allowed to edit this place.", 401);
    return next(err);
  }

  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (e) {
    const err = new HttpError(
      "something went wrong. could not update place.",
      500
    );
    return next(err);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const { pid } = req.params;
  let place;
  try {
    place = await Place.findById(pid).populate("creator");
  } catch (e) {
    const err = new HttpError(
      "something went wrong. could not delete place.",
      500
    );
    return next(err);
  }

  if (!place) {
    const err = new HttpError("could not find place for this id.", 404);
    return next(err);
  }

  if (place.creator.id !== req.userData.userId) {
    const err = new HttpError(
      "You are not allowed to delete this placee.",
      401
    );
    return next(err);
  }

  let user;
  try {
    user = await User.findById(place.creator);
    if (!user) {
      const err = new HttpError("Could not find user for provided id .", 404);
      return next(err);
    }
  } catch (e) {
    const err = new HttpError("deleting place failed, please try again.", 500);
    return next(err);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    console.log(e);
    const err = new HttpError(
      "something went wrong. could not delete place.",
      500
    );
    return next(err);
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({ placeId: pid });
  // res.status(204).json({ placeId: pid });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
