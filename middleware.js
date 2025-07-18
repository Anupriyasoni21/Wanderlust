const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema} = require("./schema.js");
const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn=(req,res,next) =>
    {if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if( req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    let { id }=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validationListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMssg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMssg);
    } else {
        next();
    }
}

module.exports.validationReview = (req, res, next) => {
    console.log("Body received:", req.body.review);
    let { error } = reviewSchema.validate(req.body.review);
    if (error) {
        let errMssg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMssg);
    } else {
        next();
    }
}
module.exports.isreviewAuthor=async(req,res,next)=>{
    let {id,reviewId }=req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}