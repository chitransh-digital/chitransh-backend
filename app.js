const express = require("express");
const cors = require("cors");
const {
  initializeFirebaseAdmin,
} = require("./config/firebase-messaging-config");
const NotificationController = require("./controllers/messagingController");
const JobController = require("./controllers/jobController");
const AuthController = require("./controllers/authController");
const MemberController = require("./controllers/memberController");
const { json } = require("body-parser");
const { default: mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(json());
app.use(cookieParser());

const corsOption = {
  origin: ["http://localhost:3000", "https://main--chitranshadmin.netlify.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
app.use(cors(corsOption));

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use("/notification/", NotificationController);
app.use("/job/", JobController);
app.use("/auth/", AuthController);
app.use("/member/", MemberController);

app.all("*", async (req, res) => {
  res.json({ message: "Invalid route" });
});

const start = async () => {
  initializeFirebaseAdmin();

  const mongoURI = process.env.MONGO_URI || "mongodb://localhost/chitransh";
  await mongoose.connect(mongoURI);
  
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

start();