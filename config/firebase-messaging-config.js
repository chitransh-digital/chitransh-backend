const admin = require("firebase-admin");
const serviceAccount = require("../community-app-a2ac0-firebase-adminsdk-lqfs8-8322e42c18.json");

const initializeFirebaseAdmin = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

module.exports = { initializeFirebaseAdmin };
