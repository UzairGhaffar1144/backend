const express = require("express");
const router = express.Router();
const { Appointment } = require("../../models/appointment");
const { Patient } = require("../../models/patient");
const { Psychologist } = require("../../models/psychologist");

// POST a new appointment
router.post("/", async (req, res) => {
  try {
    const {
      patient_id,
      psychologist_id,
      datetime,
      status,
      notes,
      prescription,
      location,
      fee,
      appointmenttype,
      reviewed,
      review_id,
      reschedule_count,
    } = req.body;

    const patient = await Patient.findById(patient_id);
    if (!patient) return res.status(404).send("Patient not found");

    const psychologist = await Psychologist.findById(psychologist_id);
    if (!psychologist) return res.status(404).send("Psychologist not found");

    const appointment = new Appointment({
      patient_id,
      psychologist_id,
      datetime,
      status,
      notes,
      prescription,
      location,
      fee,
      appointmenttype,
      reviewed,
      review_id,
      reschedule_count,
    });

    await appointment.save();
    res.send(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient_id")
      .populate("psychologist_id");
    res.send(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// // GET a single appointment by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const appointment = await Appointment.findById(req.params.id)
//       .populate("patient_id")
//       .populate("psychologist_id");
//     if (!appointment) return res.status(404).send("Appointment not found");
//     res.send(appointment);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// update an existing appointment by ID
router.put("/:id", async (req, res) => {
  try {
    const updateObject = {};
    for (const [key, value] of Object.entries(req.body)) {
      updateObject[key] = value;
    }
    // const appointment = await Appointment.findById(req.params.id);
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: updateObject },
      { new: true }
    );
    // .populate("patient_id")
    // .populate("psychologist_id", "-onlineAppointment", "-onsiteAppointment");
    if (!appointment) return res.status(404).send("Appointment not found");

    // appointment.patient_id = req.body.patient_id;
    // appointment.psychologist_id = req.body.psychologist_id;
    // appointment.time = req.body.time;
    // appointment.status = req.body.status;
    // appointment.prescription = req.body.prescription;
    // appointment.notes = req.body.notes;
    // appointment.reschedule_count = appointment.reschedule_count + 1;

    // await appointment.save();

    res.send(appointment);
    // const appointment = await Appointment.findByIdAndUpdate(
    //   req.params.id,
    //   {
    //     patient_id: req.body.patient_id,
    //     psychologist_id: req.body.psychologist_id,
    //     time: req.body.time,
    //     status: req.body.status,
    //     prescription: req.body.prescription,
    //     notes: req.body.notes,
    //     reschedule_count : appointment.reschedule_count + 1
    //   },
    //   { new: true }
    // );

    // if (!appointment) return res.status(404).send("Appointment not found");
    // res.send(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// DELETE an appointment by ID
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).send("Appointment not found");
    }
    await appointment.remove();
    res.send(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET all appointments for a psychologist
router.get("/psychologist/:psychologistId", async (req, res) => {
  try {
    const psychologist = await Psychologist.findById(req.params.psychologistId);
    if (!psychologist) return res.status(404).send("psychologistt not found");
    const appointments = await Appointment.find({
      psychologist_id: req.params.psychologistId,
    }).populate({
      path: "patient_id",
      populate: {
        path: "user_id",
        select: "name email",
      },
    });
    res.send(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET all appointments for a patient
router.get("/patient/:patientId", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).send("patient not found");
    const appointments = await Appointment.find({
      patient_id: req.params.patientId,
    }).populate({
      path: "psychologist_id",
      select: "-onlineAppointment -onsiteAppointment",
      populate: {
        path: "user_id",
        select: "name email",
      },
    });

    res.send(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
