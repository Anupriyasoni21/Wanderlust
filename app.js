if(process.env.NODE_ENV !="production"){
require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const dbUrl=process.env.ATLASDB_URL;
main()
    .then((res) => {
        console.log("connect successfuly");
    }).catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
})
const sessionOption={
    store,
    secret:process.env.SECRET,
    resave:false,
   saveUninitialized:true,
   cookie:{
    expires:Date.now() +7 * 24 * 60 * 60 * 1000,
    maxAge:7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
   }
};



app.use(session(sessionOption));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));  //user authenticate through localstrategy using method authenticate.

passport.serializeUser(User.serializeUser());  //store info in session
passport.deserializeUser(User.deserializeUser()); //delete info from session when session ended

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    /*  res.status(404).send("page not found"); */
    next(new ExpressError(404, "page not found"));
});

//error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "somethimg went wrong" } = err;
    console.error(err);
    res.status(statusCode).render("listings/error.ejs", { err });
    /* res.status(statusCode).send(message); */
});

app.listen(8080, (req, res) => {
    console.log("Server working");
});

