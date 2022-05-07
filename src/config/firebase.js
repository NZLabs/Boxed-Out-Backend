const admin = require("firebase-admin");

const serviceAccount = require("../../secrets/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

db = admin.firestore();

module.exports = { admin, db };
