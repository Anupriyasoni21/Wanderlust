const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Reviews = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validationReview, isLoggedIn,isreviewAuthor}=require("../middleware.js");

const reviewController=require("../controller/review.js");

//Reviews
//post route
router.post("/",isLoggedIn,validationReview, wrapAsync(reviewController.createReview));

//delet route
router.delete("/:reviewId",isLoggedIn,isreviewAuthor ,wrapAsync(reviewController.destroyReview));

module.exports = router;