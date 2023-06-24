// bill schema
const mongoose = require("mongoose");

const commissioncollectedSchema = new mongoose.Schema({
  ammountcollected: {
    type: Number,
    default: 0,
  },
});
const Commissioncollected = mongoose.model(
  "Commissioncollected",
  commissioncollectedSchema
);

module.exports.Commissioncollected = Commissioncollected;
