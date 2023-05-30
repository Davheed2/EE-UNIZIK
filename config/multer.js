const multer = require("multer");
const {Storage} = require("@google-cloud/storage");

const storage = new Storage();

//const storage = multer.memoryStorage();
const upload = multer({
  storage: storage
});


module.exports = upload;