const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
 const DEFAULT_COORDINATES = [77.1025, 28.7041];

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderland";

main()
  .then(() => {
    console.log("Connected successfully");
    initDB(); // Step 1: Initialize DB
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const geocoder = require("../utils/geocoder");

// 🌟 STEP 1: Initialize DB
const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "685ad9360f53f4e8667944be", // Replace with actual user ID
     geometry: {
      type: "Point",
      coordinates:DEFAULT_COORDINATES  // dummy value to satisfy schema
    }
  }));
  await Listing.insertMany(initData.data);
  console.log("Data initialized");

  // After initializing DB → run migration
  await migrateListings();
};

// 🌟 STEP 2: Migrate listings to add geometry
async function migrateListings() {
   

  const listings = await Listing.find({});
  for (let listing of listings) {
    if (!listing.geometry || listing.geometry.coordinates.length === 0) {
      const geoData = await geocoder.geocode(listing.location);
      if (geoData[0]) {
        listing.geometry = {
          type: "Point",
          coordinates: [geoData[0].longitude, geoData[0].latitude],
        };
        await listing.save();
        console.log(`Updated: ${listing.title}`);
      } else {
        // Fallback to default location
      listing.geometry = {
        type: "Point",
        coordinates: DEFAULT_COORDINATES,
      };
        console.log(`Failed to geocode: ${listing.title}`);
      }
    }
  }
  console.log("Migration completed.");
}
