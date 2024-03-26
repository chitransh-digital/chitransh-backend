const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const AdminConfig = require("../models/AdminConfig");
const { allowAdmin } = require("../middlewares/authMiddleware");
require("dotenv").config();

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.ADMIN_JWT_SIGNATURE, {
    expiresIn: maxAge,
  });
};

router.post("/loginAdmin", async (req, res) => {
  try {
    const { password } = req.body;
    const adminConfig = await AdminConfig.findOne();
    bcrypt.compare(password, adminConfig.password, function (err, result) {
        const token = createToken(adminConfig.id);
      if (result) {
        res.cookie("jwt", token, { maxAge : maxAge * 1000 })
        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/isLoggedIn", allowAdmin, async (req, res) => {
  res.status(200).json({ message: "Authorized" });
});

router.put("/changeAdminPassword", allowAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    bcrypt.hash(password, 10, async function (err, hash) {
      const adminConfig = await AdminConfig.findOne();
      adminConfig.password = hash;
      await adminConfig.save();
      res
        .status(200)
        .json({ status: true, message: "Password changed successfully" });
    });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;
