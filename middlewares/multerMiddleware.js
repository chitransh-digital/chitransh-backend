const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

export const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('file');

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|mp4|mkv|avi|pdf|doc|docx|ppt|pptx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images, Videos, PDFs, and Documents Only!');
  }
}

const uploadImage = (req, res, next) => {
  console.log(req.body, req.file, "nw");
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    next();
  });
  next();
};

module.exports = uploadImage;