const express = require("express");
const router = express.Router();
const { Notification } = require("../../models/notification");

//post a new notification
router.post("/", async (req, res) => {
  try {
    const { user_id, type, message } = req.body;
    // Create a new notification
    const notification = new Notification({
      user_id: user_id,
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

router.get("/:type/:user_id", async (req, res) => {
  try {
    const { type, user_id } = req.params;

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
