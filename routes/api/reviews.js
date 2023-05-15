const express = require("express");
const router = express.Router();
const { Appointment } = require("../../models/appointment");
const { Review } = require("../../models/review");
const { Psychologist } = require("../../models/psychologist");
// Create a new review
// POST /reviews
// Add a new review for an appointment
router.post("/:id", async (req, res) => {
  try {
    // Validate request body
    // const { error } = validateReview(req.body);
    // if (error) {
    //   return res.status(400).send({ message: error.details[0].message });
    // }
    const rating = parseFloat(req.body.rating);
    if (isNaN(rating)) {
      return res.status(400).send({ message: "Invalid rating value" });
    }
    // Check if appointment exists
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(400).send({ message: "Invalid appointment ID" });
    }

    // Create new review
    const review = new Review({
      psychologist_id: appointment.psychologist_id,
      appointment_id: req.params.id,
      rating: rating,
      comment: req.body.comment,
      patientname: req.body.patientname,
    });

    // Save new review
    await review.save();

    // Add review ID to appointment review
    appointment.review_id = review._id;
    // Update appointment's reviewed field to true
    appointment.reviewed = true;

    appointment.review_id = review._id;
    await appointment.save();

    const psychologist = await Psychologist.findById(
      appointment.psychologist_id
    );
    if (psychologist) {
      const totalratings = psychologist.totalratings || 0;
      const currentRating = psychologist.rating || 0;

      const newtotalratings = totalratings + 1;
      let newRating = 0;
      if (currentRating === 0) {
        newRating = rating;
      } else {
        newRating = (currentRating * totalratings + rating) / newtotalratings;
      }
      psychologist.rating = newRating;
      psychologist.totalratings = newtotalratings;
      await psychologist.save();
    }
    res.status(200).send({ message: "Review added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

// GET /psychologists/:id/reviews
// Get all reviews for a specific psychologist
router.get("/:psychologistsid", async (req, res) => {
  try {
    // Get psychologist ID from params
    const psychologistId = req.params.psychologistsid;

    // Find reviews for the psychologist and populate appointment field
    const reviews = await Review.find({ psychologist_id: psychologistId });
    res.status(200).send(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
