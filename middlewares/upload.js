const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'import_' + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    (file.fieldname === 'photo' && ['.jpg', '.jpeg', '.png'].includes(ext)) ||
    (file.fieldname === 'file' && ['.xls', '.xlsx'].includes(ext))
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type for field ${file.fieldname}`));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
