const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); /// token to verify genereated token

const config = require("config");
const validatePsychologist = require("../../middlewares/validatePsychologist");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");
var { Psychologist } = require("../../models/psychologist");
var { User } = require("../../models/user");

// Get all psychologists
router.get("/", async (req, res) => {
  try {
    const psychologists = await Psychologist.find().populate("user_id");
    res.send(psychologists);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

// Get psychologist by ID
router.get("/:id", async (req, res) => {
  try {
    const psychologist = await Psychologist.findById(req.params.id).populate(
      "user_id"
    );
    if (!psychologist) return res.status(404).send("Psychologist not found");
    res.send(psychologist);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

// POST a new psychologist
router.post("/addnewpsychologist", async (req, res) => {
  try {
    const {
      user_id,
      psychologist_name,
      specialization,
      experience,
      rating,
      onlineAppointment,
      onsiteAppointment,
      approved,
    } = req.body;
    // Check if user exists
    try {
      const user = await User.findById(user_id);
    } catch (err) {
      console.error(err.message);
      return res.status(404).send("User not found");
    }

    // Check if psychologist already exists
    const existingPsychologist = await Psychologist.findOne({
      user_id,
      psychologist_name,
    });
    if (existingPsychologist) {
      return res.status(400).send("Psychologist already exists");
    }
    const psychologist = new Psychologist({
      user_id,
      psychologist_name,
      specialization,
      experience,
      rating,
      onlineAppointment,
      onsiteAppointment,
      approved,
    });

    psychologist = await psychologist.save();
    res.send(psychologist);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// PUT (update) an existing psychologist
router.put("/:id", async (req, res) => {
  try {
    const psychologist = await Psychologist.findByIdAndUpdate(
      req.params.id,
      {
        user_id: req.body.user_id,
        psychologist_name: req.body.psychologist_name,
        specialization: req.body.specialization,
        experience: req.body.experience,
        rating: req.body.rating,
        onlineAppointment: req.body.onlineAppointment,
        onsiteAppointment: req.body.onsiteAppointment,
        approved: req.body.approved,
      },
      { new: true }
    );
    if (!psychologist)
      return res
        .status(404)
        .send("The psychologist with the given ID was not found");

    res.send(psychologist);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE a psychologist
router.delete("/:id", async (req, res) => {
  try {
    const psychologist = await Psychologist.findByIdAndRemove(req.params.id);
    if (!psychologist)
      return res
        .status(404)
        .send("The psychologist with the given ID was not found");

    res.send(psychologist);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
