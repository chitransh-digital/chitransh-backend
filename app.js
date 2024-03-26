const express = require("express");
const cors = require("cors");
const {
  initializeFirebaseAdmin,
} = require("./config/firebase-messaging-config");
const NotificationController = require("./controllers/messagingController");
const { json } = require("body-parser");
const { default: mongoose } = require("mongoose");
const { default: Jobs } = require("./models/Job");
require("dotenv").config();

const app = express();
app.use(express.json());

const corsOption = {
  origin: ["http://localhost:3000", "https://main--chitranshadmin.netlify.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOption));
app.use(json());

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use("/notification/", NotificationController);

app.all("*", async (req, res) => {
  throw new Error("Route Not Found : " + req.originalUrl);
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