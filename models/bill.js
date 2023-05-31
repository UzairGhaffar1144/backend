const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  psychologistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Psychologist",
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Bill = mongoose.model("Bill", billSchema);

module.exports.Bill = Bill;
