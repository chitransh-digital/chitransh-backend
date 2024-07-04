const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const fs = require("fs");
const path = require("path");
const { allowAuth } = require("../middlewares/authMiddleware");
const { captFirstLetter } = require("../middlewares/capitalizationMiddleware");

router.post("/registerBusiness", allowAuth, captFirstLetter, async(req,res)=>{
    try {
        const business = new Business(req.body);
        const businessJob = await business.save();
        if (!businessJob) {
          res.status(400).json({ status: false, message: "Failed to add Business" });
        }
        res.status(200).json({ status: true, message: "Business added successfully" });
      } catch (err) {
        res.status(400).json({ status: false, message: err.message });
      }
});

router.get("/getBusinesses", allowAuth, async(req,res)=>{
    try {
        //Filtering
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
    
        const total = await Business.countDocuments();
        const totalPages = Math.ceil(total / limit);
        if (skip >= total) return res.status(400).json({ message: "Page does not exist!" });
    
        let filterQuery = await Business.find(JSON.parse(filterStr))
          .sort(sortBy)
          .skip(skip)
          .limit(limit);
    
        const baseUrl = req.protocol + '://' + req.get('host');
        const BusinessList = filterQuery.map(business => {
          if (business.images && business.images.length > 0) {
            business.images = business.images.map(image => `${baseUrl}${image}`);
          }
          if(business.attachments && business.attachments.length > 0){
            business.attachments = business.attachments.map(attachment => `${baseUrl}${attachment}`);
          }
          return business;
        });
    
        res.json({
          businesses: BusinessList,
          count: BusinessList.length,
          totalPages: totalPages,
          status: true,
          message: "Businesses fetched successfully!",
        });
      } catch (error) {
        res.status(500).json({ status: false, message: error.message });
      }
});

router.patch("/updateBusiness/:id",allowAuth, captFirstLetter,async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      res.status(404).json({ status: false, message: "Business not found" });
    }
    if (req.body.images) {
      const baseUrl = req.protocol + '://' + req.get('host');
      req.body.images[0] = req.body.images[0].replace(baseUrl, '');
    }
    if (req.body.attachments) {
      const baseUrl = req.protocol + '://' + req.get('host');
      req.body.attachments[0] = req.body.attachments[0].replace(baseUrl, '');
    }
    if(req.body.images || req.body.attachments){
      if(business.images && business.images.length > 0){
        const oldImagePath = path.join(__dirname, '..', business.images[0]);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete old image:', err.message);
          }
        });
      }
      if(business.attachments && business.attachments.length > 0){
        const oldAttachmentPath = path.join(__dirname, '..', business.attachments[0]);
        fs.unlink(oldAttachmentPath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete old attachment:', err.message);
          }
        });
      }
    }

    const updatedBusiness = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!updatedBusiness){
      res.status(400).json({ status: false, message: "Failed to update business" });
    }

    const baseUrl = req.protocol + '://' + req.get('host');
    updatedBusiness.images = updatedBusiness.images.map(image => `${baseUrl}${image}`);

    res.status(200).json({ status: true, message: "Business updated successfully", business: updatedBusiness });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.delete("/deleteBusiness/:id",allowAuth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      res.status(404).json({ status: false, message: "Business not found" });
    }
    try{
      if(business.images && business.images.length > 0){
        const oldImagePath = path.join(__dirname, '..', business.images[0]);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete image:', err.message);
          }
        });
      }
      if(business.attachments && business.attachments.length > 0){
        const oldAttachmentPath = path.join(__dirname, '..', business.attachments[0]);
        fs.unlink(oldAttachmentPath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete attachment:', err.message);
          }
        });
      }
    }catch(err){
      console.error('Failed to delete image:', err.message);
    }
    await Business.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: true, message: "Business deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;