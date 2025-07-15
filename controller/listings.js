const geocoder=require("../utils/geocoder.js");
const Listing=require("../models/listing");
const { cloudinary,uploadToCloudinary } = require("../cloudConfig.js");


module.exports.index=async (req, res) => {
    const allList = await Listing.find({});
    res.render("listings/index.ejs", { allList });
};

module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if(!listing){
          req.flash("error","Listing you requested for does not exit!");
          return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}


module.exports.addListing = async (req, res, next) => {
  try {
    const geoData = await geocoder.geocode(req.body.Listing.location);

  if (!geoData[0]) {
    req.flash("error", "Location not found. Try a different address.");
    return res.redirect("/listings/new");
  }

  const newlist = new Listing(req.body.Listing);
  newlist.owner = req.user._id;

  // Add geo-coordinates
  newlist.geometry = {
    type: "Point",
    coordinates: [geoData[0].longitude, geoData[0].latitude]
  };

  // Upload image to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, "wanderlust_Dev");
  newlist.image = {
    url: result.secure_url,
    filename: result.public_id
  };

  await newlist.save();
  req.flash("success", "New Listing Created!");
  res.redirect(`/listings/${newlist._id}`);
   
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while creating the listing.");
    res.redirect("/listings/new");
  }
};



module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exit!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;

   
    if (originalImageUrl.includes("/upload/")) {
  // Resizing works for Cloudinary URLs
  originalImageUrl = originalImageUrl.replace(
    "/upload/",
    "/upload/c_fill,h_200,w_300/"
  );
} else {
  // Old non-Cloudinary image, show original size
  console.warn("Non-Cloudinary image. No resize applied.");
}
  
    res.render("listings/edit.ejs", { listing,originalImageUrl});
}

module.exports.upadetListing=async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.Listing });
    //update location if changed
    
    if (req.body.Listing.location !== listing.location) {
    
    const geoData = await geocoder.geocode(req.body.Listing.location);
    
    if (!geoData[0]) {
      req.flash("error", "Location not found. Try a different address.");
      return res.redirect(`/listings/${id}/edit`);
    }
    listing.geometry = {
      type: "Point",
      coordinates: [geoData[0].longitude, geoData[0].latitude]
    };
    console.log(listing.geometry);
  }
    await listing.save(); 

     if (req.file) {
    // Delete old image from Cloudinary
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }
    //  Upload new image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "wanderlust_Dev");
    // Update image field in DB
    listing.image = {
      url: result.secure_url,
      filename: result.public_id, // Cloudinary public_id for later deletes
    };
    await listing.save(); // Save updated image info
  }
    req.flash("success"," Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing=async (req, res) => {
    let { id } = req.params;
    const deletedList = await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}


module.exports.searchListing = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    req.flash("error", "Please enter a valid search term");
    return res.redirect("/listings");
  }

  // Search for listings with title or location matching the query
  const listings = await Listing.find({title: new RegExp(query, "i") });

  if (!listings.length) {
    req.flash("error", `No results found for "${query}"`);
    return res.redirect("/listings");
  }

  res.render("listings/search", { listings, query });
}
