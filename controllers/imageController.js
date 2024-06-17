const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middlewares/multerMiddleware');
const fs = require('fs');
const path = require('path');
const { allowAuth } = require('../middlewares/authMiddleware');

router.post('/upload',allowAuth, (req, res) => {
    uploadMiddleware(req, res, (err) => {
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

module.exports = router;