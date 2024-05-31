const express = require("express");
const cors = require("cors");
const path = require("path");
const {
  initializeFirebaseAdmin,
} = require("./config/firebase-messaging-config");
const NotificationController = require("./controllers/messagingController");
const JobController = require("./controllers/jobController");
const BusinessController = require("./controllers/businessController");
const AuthController = require("./controllers/authController");
const MemberController = require("./controllers/memberController");
const NewsController = require("./controllers/newsController");
const KaryakarniController = require("./controllers/karyakarniController");
const uploadController = require("./controllers/imageController");
const { json } = require("body-parser");
const { default: mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const corsOption = {
  origin: ["http://localhost:3000", "https://main--chitranshadmin.netlify.app", "http://159.89.165.67"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
app.use(cors(corsOption));

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use("/api/notification/", NotificationController);
app.use("/api/job/", JobController);
app.use("/api/business/", BusinessController);
app.use("/api/auth/", AuthController);
app.use("/api/member/", MemberController);
app.use("/api/feeds/",NewsController);
app.use("/api/karyakarni",KaryakarniController);
app.use("/api/image",uploadController);

app.all("*", async (req, res) => {
  res.json({ message: "Invalid route" });
});

const start = async () => {
  initializeFirebaseAdmin();

  const mongoURI = process.env.MONGO_URI;
  await mongoose.connect(mongoURI);
  
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

start();