const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  patientId: {
    type: String,
  },
  psychologistId: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports.Notification = Notification;
