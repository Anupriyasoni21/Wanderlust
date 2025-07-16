const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  httpAdapter: 'https', 
  userAgent: 'wanderlust-app (sonianupriya204@gmail.com)',
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
