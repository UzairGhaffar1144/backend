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
router.get("/allpsychologists", async (req, res) => {
  try {
    const psychologists = await Psychologist.find().populate(
      "user_id",
      "-password"
    );
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
      "user_id",
      "-password"
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
      degree,
      about,
      contactnumber,
      gender,
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
      degree,
      about,
      contactnumber,
      gender,
      experience,
      rating,
      onlineAppointment,
      onsiteAppointment,
      approved,
    });

    await psychologist.save();
    res.send(psychologist);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// PUT (update) an existing psychologist
router.put("/:id", async (req, res) => {
  try {
    const updateObject = {};
    for (const [key, value] of Object.entries(req.body)) {
      updateObject[key] = value;
    }

    const psychologist = await Psychologist.findByIdAndUpdate(
      req.params.id,
      { $set: updateObject },
      { new: true }
    ).populate("user_id", "-password");
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
