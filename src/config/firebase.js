const admin = require("firebase-admin");

let configs = null;
if (process.env.NODE_ENV !== "development") {
  configs = JSON.parse(process.env.firebase_config);
} else {
  const serviceAccount = require("../../secrets/serviceAccount.json");
  configs = serviceAccount;
}

console.log(configs);
admin.initializeApp({
  credential: admin.credential.cert(configs),
});

db = admin.firestore();

module.exports = { admin, db };
