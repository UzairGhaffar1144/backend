const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); /// token to verify genereated token

const config = require("config");
const validatePatient = require("../../middlewares/validatePatient");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");
var { Patient } = require("../../models/patient");
var { User } = require("../../models/user");

router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().populate("user_id");
    res.send(patients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET a single patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("user_id");
    if (!patient) return res.status(404).send("Patient not found");

    res.send(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// POST a new patient
router.post("/addnewpatient", async (req, res) => {
  try {
    const {
      user_id,
      patient_name,
      age,
      gender,
      occupation,
      contact_number,
      records,
    } = req.body;
    console.log(user_id);
    // Check if user exists

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(400).send("User does not exist");
    }
    // Check if patient already exists
    const existingPatient = await Patient.findOne({ user_id, patient_name });
    if (existingPatient) {
      return res.status(400).send("Patient already exists");
    }

    const patient = new Patient({
      user_id,
      patient_name,
      age,
      gender,
      occupation,
      contact_number,
      records,
    });

    await patient.save();
    res.send(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// PUT/update an existing patient by ID
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.body.user_id);
    if (!user) return res.status(404).send("uUer not found");

    const patient = await Patient.findOneAndUpdate(
      { user_id: req.params.id },
      {
        patient_name: req.body.patient_name,
        age: req.body.age,
        gender: req.body.gender,
        occupation: req.body.occupation,
        contact_number: req.body.contact_number,
        records: req.body.records,
      },
      { new: true }
    ).populate("user_id");

    if (!patient) return res.status(404).send("Patient not found");
    res.send(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// DELETE a patient by ID
router.delete("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndRemove(req.params.id);
    // .populate(
    //   "user_id"
    // );
    if (!patient) return res.status(404).send("Patient not found");
    res.send(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
