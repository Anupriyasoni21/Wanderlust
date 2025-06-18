const express= require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path= require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const{listingSchema}=require("./schema.js");
 
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());
const MONGO_URL='mongodb://127.0.0.1:27017/wonderland';

main()
.then((res)=>{
    console.log("connect successfuly");
}).catch((err)=>{
    console.log(err);
});

async function main() {
   await mongoose.connect(MONGO_URL);
}


app.get("/",(req,res)=>{
    res.send("Hey! Welcome to my website");
});

//index route
app.get("/listings", wrapAsync(async(req,res)=>{
    const allList=await Listing.find({});
    res.render("listings/index.ejs",{allList});
}));

//New route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
 

//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const list=await Listing.findById(id);
    res.render("listings/show.ejs",{list});
}));

//Adding route
app.post("/listings", wrapAsync (async(req,res,next)=>{
    console.log('Listing:', Listing); 
    let result=listingSchema.validate(req.body);
    console.log(result);
    const newlist=new Listing(req.body.Listing);
    await newlist.save();
    res.redirect ("/listings");
})
);

//edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id",wrapAsync(async(req,res)=>{
  let{id}=req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.Listing});
  res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id",wrapAsync(async (req, res)=> {
    let {id} = req.params;
    const deletedList = await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    res.redirect("/listings");
}));


app.use((req, res,next) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
   /*  res.status(404).send("page not found"); */
    next(new ExpressError(404,"page not found"));
  });

//error handling middleware
app.use((err, req, res, next) => {
        const { statusCode=500 , message="somethimg went wrong" } = err;
        console.error(err);
        res.status(statusCode).render("listings/error.ejs",{err});
        /* res.status(statusCode).send(message); */
});

app.listen(8080,(req,res)=>{
    console.log("Server working");
}); 

