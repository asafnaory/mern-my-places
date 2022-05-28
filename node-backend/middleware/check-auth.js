const HttpError = require("../Models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if(req.method === "OPTIONS"){
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      const err = new HttpError("Authentication failed!");
      throw new Error(err);
    }
    const decodedToken = jwt.verify(token, "supersecret_dont_share");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (e) {
    const err = new HttpError("Authentication failed!", 403);
    return next(err);
  }
};
