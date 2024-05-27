const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const fs = require("fs");
const path = require("path");

router.post("/registerBusiness",async(req,res)=>{
    try {
        const business = new Business(req.body);
        const businessJob = await business.save();
        if (!businessJob) {
          throw new Error("Couldn't add business");
        }
        res.status(200).json({ status: true, message: "Business added successfully" });
      } catch (err) {
        res.status(400).json({ status: false, message: err.message });
      }
});

router.get("/getBusinesses",async(req,res)=>{
    try {
        //Filtering
        const filter = { ...req.query };
        const excludeFields = ["limit", "sort", "page"];
        excludeFields.forEach((element) => {
          delete filter[element];
        });
        let filterStr = JSON.stringify(filter);
    
        //Sorting
        const sortBy = req.query.sort
          ? req.query.sort.split(",").join(" ")
          : "name";
    
        //Pagination
        const page = req.query.page ? req.query.page : 1;
        const limit = req.query.limit ? req.query.limit : 10;
        const skip = (page - 1) * limit;
    
        const total = await Business.countDocuments();
        // console.log(total);
        if (skip >= total) throw new Error("Page does not exist!");
    
        let filterQuery = await Business.find(JSON.parse(filterStr))
          .sort(sortBy)
          .skip(skip)
          .limit(limit);
    
        // const businessList = filterQuery;
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
          status: true,
          message: "Businesses fetched successfully!",
        });
      } catch (error) {
        throw new Error(error);
      }
});

router.patch("/updateBusiness/:id", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      throw new Error("Couldn't update business");
    }
    console.log(req.body)
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
      throw new Error("Couldn't update business");
    }

    const baseUrl = req.protocol + '://' + req.get('host');
    updatedBusiness.images = updatedBusiness.images.map(image => `${baseUrl}${image}`);

    res.status(200).json({ status: true, message: "Business updated successfully", business: updatedBusiness });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.delete("/deleteBusiness/:ownerID/:name", async (req, res) => {
  try {
    const { ownerID, name } = req.params;
    const business = await Business.findOne({ ownerID, name });
    if (!business) {
      throw new Error("Couldn't delete business");
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
      throw new Error(err);
    }
    await Business.findOneAndDelete({ ownerID, name });
    res.status(200).json({ status: true, message: "Business deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;