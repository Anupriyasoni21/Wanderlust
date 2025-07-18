const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController=require("../controller/user.js");
const user = require("../models/user.js");


//signup page
router
.route("/signup")
.get(userController.renderSignupForm)
.post( wrapAsync(userController.signup));

//login page
router
.route("/login")
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),
    wrapAsync(userController.login)
);

//logout router
router.get("/logout",userController.logout);

module.exports = router;