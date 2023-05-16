const multer = require('multer');
const path = require('path');

//multer configuration

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext!== '.png' && ext!== '.jpg' && ext!== '.jpeg' && ext!== '.gif' && ext!== '.pdf') {
            return cb(new Error('Only images are allowed!'), false);
        }
        cb(null, true);
    }
})