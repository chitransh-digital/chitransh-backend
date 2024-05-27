const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerMiddleware');
const fs = require('fs');
const path = require('path');

router.post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err });
      }
  
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      res.status(200).json({
        message: 'File uploaded successfully',
        file: `/uploads/${req.file.filename}`
      });
    });
  });

// const deleteFile = async (filename) => {
//   try {
//     const filePath = path.join(__dirname, '..', filename);
//     fs.unlink(filePath, (err) => {
//       if (err) {
//         if (err.code === 'ENOENT') {
//           return res.status(404).json({ message: 'File not found' });
//         }
//         return res.status(500).json({ message: 'Failed to delete file' });
//       }
  
//       res.status(200).json({ message: 'File deleted successfully' });
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }

module.exports = router;