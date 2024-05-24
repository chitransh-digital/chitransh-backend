const express = require("express");
const router = express.Router();
const Feeds = require("../models/News");
const fs = require("fs");

router.post("/uploadFeeds",async(req,res)=>{
    try {
        const Feed = new Feeds(req.body);
        const newFeeds = await Feed.save();
        if (!newFeeds) {
          throw new Error("Couldn't add Feeds");
        }
        res.status(200).json({ status: true, message: "Feeds added successfully" });
      } catch (err) {
        res.status(400).json({ status: false, message: err.message });
      }
});

router.get("/getFeeds",async(req,res)=>{
    try {
        const filter = { ...req.query };
        const excludeFields = ["limit", "sort", "page"];
        excludeFields.forEach((element) => {
          delete filter[element];
        });
        let filterStr = JSON.stringify(filter);
    
        const sortBy = req.query.sort
          ? req.query.sort.split(",").join(" ")
          : "name";
    
        const page = req.query.page ? req.query.page : 1;
        const limit = req.query.limit ? req.query.limit : 10;
        const skip = (page - 1) * limit;
    
        const total = await Feeds.countDocuments();
        if (skip >= total) throw new Error("Page does not exist!");
    
        let filterQuery = await Feeds.find(JSON.parse(filterStr))
          .sort(sortBy)
          .skip(skip)
          .limit(limit);
    
        const FeedsList = filterQuery;
    
        res.json({
          Feeds: FeedsList,
          count: FeedsList.length,
          status: true,
          message: "Feeds fetched successfully!",
        });
      } catch (error) {
        throw new Error(error);
      }
});

router.patch("/update/:id", async (req, res) => {
    try {
      const feed = await Feeds.findByIdAndUpdate(req.params.id, req.body);
      if (!feed) {
        throw new Error("Couldn't update feed");
      }
      res.status(200).json({ status: true, message: "Feed updated successfully" });
    } catch (err) {
      res.status(400).json({ status: false, message: err.message });
    }
  });

  router.delete("/delete/:id", async (req, res) => {
    try {
      const feed = await Feeds.findById(req.params.id);
      if (!feed) {
        throw new Error("Couldn't find feed");
      }
      try {
        const {imageURL} = feed.images[0];
        const filePath = path.join(__dirname, imageURL);
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