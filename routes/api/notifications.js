const express = require("express");
const router = express.Router();
const { Notification } = require("../../models/notification");

//post a new notification
router.post("/", async (req, res) => {
  try {
    const { patientId, psychologistId, type, message } = req.body;
    // Create a new notification
    const notification = new Notification({
      patientId: patientId,
      psychologistId: psychologistId,
      type: type,
      message: message,
    });
    console.log(notification);
    // Save the notification to the database
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:type/:recipientId", async (req, res) => {
  try {
    const { type, recipientId } = req.params;

    // Filter notifications based on the type and recipientId parameters
    const notifications = await Notification.find({
      type,
      $or: [{ patientId: recipientId }, { psychologistId: recipientId }],
    });
    if (notifications.length === 0) {
      return res.status(404).send("Appointment not found");
    }
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
