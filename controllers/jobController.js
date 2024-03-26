
module.exports = router;const express = require("express");
const router = express.Router();
const Jobs = require("../models/Job");

router.post("/add", async (req, res) => {
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
    const jobs = await Jobs.find();
    res.status(200).json({ status: true, jobs });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const job = await Jobs.findByIdAndUpdate(req.params.id, req.body);
    if (!job) {
      throw new Error("Couldn't update job");
    }
    res.status(200).json({ status: true, message: "Job updated successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
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
