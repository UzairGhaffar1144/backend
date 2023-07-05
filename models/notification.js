const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  // patientId: {
  //   type: String,
  // },
  // psychologistId: {
  //   type: String,
  // },
  user_id: {
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
  createdAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 60 * 1000),
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports.Notification = Notification;
