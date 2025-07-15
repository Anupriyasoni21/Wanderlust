const express=require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validationListing}=require("../middleware.js");
const listingController=require("../controller/listings.js");



const multer= require("multer");
const {upload,uploadToCloudinary }=require("../cloudConfig.js");

//index & create route
router
.route("/")
.get(wrapAsync(listingController.index))
.post( isLoggedIn,upload.single("Listing[image]"),validationListing, wrapAsync(listingController.addListing));


//New route
router.get("/new",isLoggedIn,listingController.renderNewForm);
// route for serach 
router.get("/search",wrapAsync(listingController.searchListing));

//show & update route & delete
router
.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single("Listing[image]"),validationListing, wrapAsync(listingController.upadetListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));


//edit route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));


module.exports = router;