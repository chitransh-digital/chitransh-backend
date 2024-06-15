const admin = require("firebase-admin");
const serviceAccount = require("../community-app-a2ac0-firebase-adminsdk-lqfs8-8cecd3d74d.json");

const initializeFirebaseAdmin = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

module.exports = { initializeFirebaseAdmin };
