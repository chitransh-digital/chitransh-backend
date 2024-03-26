const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin");
const serviceAccount = require("../community-app-a2ac0-firebase-adminsdk-lqfs8-7f994ad5f5.json");

const initializeFirebaseAdmin = () => {
  initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

module.exports = { initializeFirebaseAdmin };
