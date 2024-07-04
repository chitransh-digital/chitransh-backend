const express = require("express");
const router = express.Router();
const Jobs = require("../models/Job");
const { allowAdmin, allowAuth } = require("../middlewares/authMiddleware");
const { captFirstLetter } = require("../middlewares/capitalizationMiddleware");

router.post("/add",allowAdmin,captFirstLetter, async (req, res) => {
  try {
    const job = new Jobs(req.body);
    const savedJob = await job.save();
    if (!savedJob) {
      res.status(400).json({ status: false, message: "Failed to add job" });
    }
    res.status(200).json({ status: true, message: "Job added successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.get("/getAll",allowAuth, async (req, res) => {
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
    
        const total = await Jobs.countDocuments();
        const totalPages = Math.ceil(total / limit);
        if (skip >= total) return res.status(400).json({ message: "Page does not exist!" });
    
        let filterQuery = await Jobs.find(JSON.parse(filterStr))
          .sort(sortBy)
          .skip(skip)
          .limit(limit);
    res.status(200).json({ status: true, jobs: filterQuery, count: filterQuery.length, totalPages: totalPages });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.patch("/update/:id",allowAdmin,captFirstLetter, async (req, res) => {
  try {
    const job = await Jobs.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) {
      res.status(400).json({ status: false, message: "Couldn't update job" });
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
      res.status(400).json({ status: false, message: "Couldn't delete job" });
    }
    res.status(200).json({ status: true, message: "Job deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;