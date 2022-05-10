const admin = require("firebase-admin");

const serviceAccount = require("../../secrets/serviceAccount.json");

let configs = null;
if (process.env.NODE_ENV === "production") {
  configs = process.env.firebase_config;
} else {
  const serviceAccount = require("../../secrets/serviceAccount.json");
  configs = serviceAccount;
}

admin.initializeApp({
  credential: admin.credential.cert(configs),
});

db = admin.firestore();

module.exports = { admin, db };
