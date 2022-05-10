const { db } = require("./firebase");
const dare = require("../questions/dare.json");
const truth = require("../questions/truth.json");

const upload_to_db = (data, type) => {
  for (let i = 0; i < data.length; i++) {
    let cats = [];
    let genders = [];
    if (data[i].cat.includes("c")) {
      cats.push("classic");
    }
    if (data[i].cat.includes("t")) {
      cats.push("teens");
    }
    if (data[i].cat.includes("p")) {
      cats.push("party");
    }
    if (data[i].cat.includes("h")) {
      cats.push("hot");
    }
    if (data[i].for.includes("m")) {
      genders.push("male");
    }
    if (data[i].for.includes("f")) {
      genders.push("female");
    }
    console.log(data[i].que);
    console.log(cats);
    console.log(genders);
    db.collection(type).doc(i.toString()).set({
      question: data[i].que,
      categories: cats,
      genders: genders,
    });
    console.log(`Uploaded:: ${i}/${data.length} \n`);
  }
  console.log("DONE :: ", type);
};

upload_to_db(truth, "truth");
upload_to_db(dare, "dare");
