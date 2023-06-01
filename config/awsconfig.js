const { S3Client } = require("@aws-sdk/client-s3");

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    // bucket: process.env.BUCKET,
    // profile: process.env.PROFILE
  },
  region: process.env.REGION_NAME
});

module.exports = client;
