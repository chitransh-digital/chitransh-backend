const express = require("express");
const router = express.Router();
const Business = require("../models/business");


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
    
        const businessList = filterQuery;
    
        res.json({
          businesses: businessList,
          count: businessList.length,
          status: true,
          message: "Businesses fetched successfully!",
        });
      } catch (error) {
        throw new Error(error);
      }
});

router.patch("/updateBusiness/:id", async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body);
    if (!business) {
      throw new Error("Couldn't update business");
    }
    res.status(200).json({ status: true, message: "Business updated successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;