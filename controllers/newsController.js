const express = require("express");
const router = express.Router();
const Feeds = require("../models/News");
const fs = require("fs");
const path = require("path");
const { allowAdmin, allowAuth } = require("../middlewares/authMiddleware");
const { captFirstLetter } = require("../middlewares/capitalizationMiddleware");

router.post("/uploadFeeds",allowAdmin,captFirstLetter,async(req,res)=>{
    try {
        const Feed = new Feeds(req.body);
        const newFeeds = await Feed.save();
        if (!newFeeds) {
          res.status(400).json({ status: false, message: "Failed to add Feeds" });
        }
        res.status(200).json({ status: true, message: "Feeds added successfully" });
      } catch (err) {
        res.status(400).json({ status: false, message: err.message });
      }
});

router.get("/getFeeds",allowAuth,async(req,res)=>{
    try {
        const filter = { ...req.query };
        const excludeFields = ["limit", "sort", "page"];
        excludeFields.forEach((element) => {
          delete filter[element];
        });
        let filterStr = JSON.stringify(filter);
    
        const sortBy = req.query.sort ? req.query.sort.split(",").join(" ") : "_id";
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = (page - 1) * limit;
    
        const total = await Feeds.countDocuments();
        const totalPages = Math.ceil(total / limit);
        if (skip >= total) return res.status(400).json({ message: "Page does not exist!" });
    
        let filterQuery = await Feeds.find(JSON.parse(filterStr))
          .sort(sortBy)
          .skip(skip)
          .limit(limit);
    
        const baseUrl = req.protocol + '://' + req.get('host');
        const FeedsList = filterQuery.map(feed => {
          if (feed.images && feed.images.length > 0) {
            feed.images = feed.images.map(image => `${baseUrl}${image}`);
          }
          return feed;
        });
    
        res.json({
          Feeds: FeedsList,
          count: FeedsList.length,
          totalPages: totalPages,
          status: true,
          message: "Feeds fetched successfully!",
        });
      } catch (error) {
        res.status(500).json({ status: false, message: error.message });
      }
});

router.patch("/update/:id",allowAdmin,  captFirstLetter,async (req, res) => {
  try {
    const feed = await Feeds.findById(req.params.id);
    if (!feed) {
      res.status(404).json({ status: false, message: "Feed not found" });
    }
    if (req.body.images) {
      const baseUrl = req.protocol + '://' + req.get('host');
      req.body.images[0] = req.body.images[0].replace(baseUrl, '');
    }
    if (req.body.images) {
      if (feed.images && feed.images.length > 0) {
        const oldImagePath = path.join(__dirname, '..', feed.images[0]);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete old image:', err.message);
          }
        });
      }
    }
    
    const updatedFeed = await Feeds.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFeed) {
      res.status(400).json({ status: false, message: "Failed to update feed" });
    }
    
    const baseUrl = req.protocol + '://' + req.get('host');
    updatedFeed.images = updatedFeed.images.map(image => `${baseUrl}${image}`);

    res.status(200).json({ status: true, message: "Feed updated successfully", feed: updatedFeed });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
  });

  router.delete("/delete/:id",allowAdmin,  async (req, res) => {
    try {
      const feed = await Feeds.findById(req.params.id);
      if (!feed) {
        res.status(404).json({ status: false, message: "Feed not found" });
      }
      try {
        const imageURL = feed.images[0];
        const filePath = path.join(__dirname,'..', imageURL);
        if(feed.images.length > 0){
          fs.unlink(filePath, (err) => {
            if (err) {
              if (err.code === 'ENOENT') {
                return res.status(404).json({ message: 'File not found' });
              }
              return res.status(500).json({ message: 'Failed to delete file' });
            }
        
            console.log('File deleted successfully');
          });
        }
      } catch (error) {
        console.error("Error deleting image:", error.message)
      }
      await Feeds.findByIdAndDelete(req.params.id);
      res.status(200).json({ status: true, message: "Feed deleted successfully" });
    } catch (err) {
      res.status(400).json({ status: false, message: err.message });
    }
  });

module.exports = router;