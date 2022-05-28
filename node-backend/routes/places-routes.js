const express = require("express");
const fileUpload = require("../middleware/file-upload");
const { check } = require("express-validator");
const placesControllters = require("../controllers/places-controller");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("/:pid", placesControllters.getPlaceById);

router.get("/user/:uid", placesControllters.getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").notEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").notEmpty(),
  ],
  placesControllters.createPlace
);

router.patch("/:pid", placesControllters.updatePlace);

router.delete("/:pid", placesControllters.deletePlace);
module.exports = router;
