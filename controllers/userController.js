const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const Member = require("../models/Member");
require("dotenv").config();

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.USER_JWT_SIGNATURE, {
    expiresIn: maxAge,
  });
};

router.post("/loginPhone", async (req, res) => {
  try {
    const { phone } = req.body;
    const family = await Member.findOne({ "members.contact": phone });
    if (family) {
      const user = await User.findOne({ phone });
      let token;
      if (!user) {
        const newUser = new User({ phone, familyID: family.familyID });
        await newUser.save();
        token = createToken(newUser.id);
      } else {
        token = createToken(user.id);
      }
      res.cookie("jwt", token, { maxAge: maxAge * 1000 });
      res.status(200).json({ token });
    } else {
      res.status(404).json({ message: "Family Head not found with the provided phone number" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/loginPhoneFamilyID", async (req, res) => {
  try {
    const { phone, familyID } = req.body;
    const family = await Member.findOne({ familyID, "members.contact": phone });
    if (family) {
      const user = await User.findOne({ phone, familyID });
      let token;
      if (!user) {
        const newUser = new User({ phone, familyID });
        await newUser.save();
        token = createToken(newUser.id);
      } else {
        token = createToken(user.id);
      }
      res.cookie("jwt", token, { maxAge: maxAge * 1000 });
      res.status(200).json({ token });
    } else {
      res.status(404).json({ message: "Family not found with provided phone number and family ID" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;