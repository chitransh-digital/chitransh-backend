const express = require("express");
const router = express.Router();
const Jobs = require("../models/Job");
const { allowAdmin } = require("../middlewares/authMiddleware");

router.post("/add",allowAdmin, async (req, res) => {
  try {
    const job = new Jobs(req.body);
    const savedJob = await job.save();
    if (!savedJob) {
      throw new Error("Couldn't add job");
    }
    res.status(200).json({ status: true, message: "Job added successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.get("/getAll", async (req, res) => {
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
    
        const total = await Jobs.countDocuments();
        if (skip >= total) throw new Error("Page does not exist!");
    
        let filterQuery = await Jobs.find(JSON.parse(filterStr))
          .sort(sortBy)
          .skip(skip)
          .limit(limit);
    res.status(200).json({ status: true, jobs: filterQuery, count: filterQuery.length });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.patch("/update/:id",allowAdmin, async (req, res) => {
  try {
    const job = await Jobs.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) {
      throw new Error("Couldn't update job");
    }
    res.status(200).json({ status: true, message: "Job updated successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.delete("/delete/:id",allowAdmin, async (req, res) => {
  try {
    const job = await Jobs.findByIdAndDelete(req.params.id);
    if (!job) {
      throw new Error("Couldn't delete job");
    }
    res.status(200).json({ status: true, message: "Job deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;