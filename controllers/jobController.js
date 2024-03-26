const express = require("express");
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

module.exports = router;