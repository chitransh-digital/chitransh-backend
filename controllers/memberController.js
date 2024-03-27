const express = require("express");
const Member = require("../models/Member");
const { allowAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/add", allowAdmin, async (req, res) => {
  try {
    const member = new Member(req.body);
    const savedMember = await member.save();
    if (!savedMember) {
      throw new Error("Couldn't add member");
    }
    res
      .status(200)
      .json({ status: true, message: "Member added successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;
