const express = require("express");
const cors = require("cors");
const { initializeFirebaseAdmin } = require("./config/firebase-messaging-config");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const corsOption = {
  origin: ["http://localhost:3000", "https://main--chitranshadmin.netlify.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

mongoose.set("strictQuery", false);
mongoose.connect('mongodb+srv://pranavbh003:yI60kDGgwmKH9LD9@cluster0.axbnepk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' 
)
mongoose.Promise = global.Promise;

app.use(cors(corsOption));

initializeFirebaseAdmin();

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});



app.all("*", async (req, res) => {
  throw new Error("Route Not Found : " + req.originalUrl);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
