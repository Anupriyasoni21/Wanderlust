const multer = require('multer');
const cloudinary=require("cloudinary").v2;
const streamifier = require('streamifier');


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
         folder:"wanderlust_Dev",
        },
      (err, result) => {
        if (result) resolve(result);
        else reject(err);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = { cloudinary,upload, uploadToCloudinary };