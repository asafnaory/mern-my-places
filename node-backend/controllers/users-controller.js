const uuid = require("uuid");
const HttpError = require("../Models/http-error");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../Models/user");

const getUsers = async (req, res, next) => {
  // const users = await User.find({}, "email name");
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (e) {
    return next(
      new HttpError("Fetching users failed, please try again later", 500)
    );
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
      );
    }
    const { name, email, password } = req.body;
    
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (e) {
    return next(
      new HttpError("Signing up failed. please try again later", 500)
    );
  }
  if (existingUser) {
    const error = new HttpError(
      "User existes alredy, please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
    console.log(await bcrypt.compare(password, hashedPassword));
  } catch (e) {
    const error = HttpError("Could not create user. please try again", 500);
    return next(error);
  }
  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });
  try {
    createdUser.save();
  } catch (e) {
    return next(e);
  }

  let token;
  try {
    toekn = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (e) {
    const error = new HttpError("Could not create user. please try again", 500);
    return next(error);
  }
  console.log(createdUser, token);
  await res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (e) {
    return next(new HttpError("Login failed. please try again later", 500));
  }
  if (!existingUser) {
    return next(
      new HttpError("Invalid credientials, could not log you in", 403)
    );
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (e) {
    const error = new HttpError(
      "Could not log you in. please check your credentials and try again ",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Could not log you in. please check your credentials and try again ",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (e) {
    const error = new HttpError("Could not create user. please try again", 500);
    return next(error);
  }
  console.log(existingUser, token);
  res.json({ userId: existingUser.id, email: existingUser.email, token});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
