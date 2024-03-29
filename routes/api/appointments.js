const express = require("express");
const router = express.Router();
const { Appointment } = require("../../models/appointment");
const { Patient } = require("../../models/patient");
const { Psychologist } = require("../../models/psychologist");
const { Chat } = require("../../models/chat");
const mongoose = require("mongoose");
const { Review } = require("../../models/review");
const { Bill } = require("../../models/bill");
const { Commissioncollected } = require("../../models/commissioncollected");

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
      appointmenttype,
      reviewed,
      review_id,
      reschedule_count,
    } = req.body;
    let fee = null;
    const patient = await Patient.findById(patient_id).populate("user_id");
    if (!patient) return res.status(404).send("Patient not found");

    const psychologist = await Psychologist.findById(psychologist_id).populate(
      "user_id"
    );
    if (!psychologist) return res.status(404).send("Psychologist not found");
    const { day, time } = datetime;

    // Find the corresponding slot in the psychologist's schedule
    const scheduleDay =
      appointmenttype === "online"
        ? psychologist.onlineAppointment.schedule.find(
            (schedule) => schedule.day === day
          )
        : psychologist.onsiteAppointment.schedule.find(
            (schedule) => schedule.day === day
          );
    fee =
      appointmenttype === "online"
        ? psychologist.onlineAppointment.fee
        : psychologist.onsiteAppointment.fee;

    if (!scheduleDay) {
      return res.status(400).send("Invalid day for appointment");
    }

    const appointmentSlot = scheduleDay.slots.find(
      (slot) => slot.start === time
    );

    if (!appointmentSlot) {
      return res.status(400).send("Invalid time for appointment");
    }
    if (!appointmentSlot.available) {
      return res.status(400).send("slot already booked");
    }

    // Set the slot availability to false
    appointmentSlot.available = false;

    // Save the updated psychologist document
    await psychologist.save();

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
    ///creating new chat for every appointments
    //make check of chat hwre chat should not exist of psychologist and patient
    const existingChat = await Chat.findOne({
      members: {
        $all: [
          psychologist.user_id._id.toString(),
          patient.user_id._id.toString(),
        ],
      },
    });

    console.log(patient);
    console.log(patient.user_id);
    console.log(psychologist);
    console.log(psychologist.user_id);
    console.log(existingChat);
    if (existingChat) {
      console.log("chatalredy exists");
    } else {
      const chat = new Chat({
        members: [
          psychologist.user_id._id.toString(),
          patient.user_id._id.toString(),
        ],

        patientname: patient.user_id.name,
        psychologistname: psychologist.user_id.name,
      });

      console.log(chat);
      await chat.save();
      console.log("newchat  created");
    }
    const bill = new Bill({
      psychologistId: psychologist_id,
      appointmentId: appointment._id,
      amount: fee * 0.9,
      status: "pending",
    });
    await bill.save();
    // const comission = new Commissioncollected({
    //   ammountcollected: fee * 0.1,
    // });
    // await comission.save();
    let commissioncollected = await Commissioncollected.findOne();
    if (!commissioncollected) {
      // If the document doesn't exist, create a new one
      commissioncollected = new Commissioncollected({
        ammountcollected: fee * 0.1,
      });
    } else {
      // Increment the commissionCollected field by 10% of the fee
      commissioncollected.ammountcollected += fee * 0.1;
    }

    // Save the updated commission collected document
    await commissioncollected.save();

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
      .populate({
        path: "psychologist_id",
        select: "-onlineAppointment -onsiteAppointment",
        populate: {
          path: "user_id",
          select: "name email",
        },
      })
      .populate({
        path: "review_id",
        match: { $expr: { $ne: ["$review_id", null] } },
      });
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
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).send("Appointment not found");
    const updateObject = req.body;
    const { status } = updateObject;
    const { records } = updateObject; // Extract the 'record' field from the request body

    if (records) {
      appointment.records.push(records); // Push the 'record' value to the 'records' array
      delete updateObject.records;
      await appointment.save(); // Remove the 'record' field from the 'updateObject'
    }
    if (
      status !== undefined &&
      (status === "completed" ||
        status === "reschedule" ||
        status === "cancelled")
    ) {
      const psychologist = await Psychologist.findById(
        appointment.psychologist_id
      );
      if (!psychologist) return res.status(404).send("Psychologist not found");

      const { day: prevDay, time: prevTime } = appointment.datetime;

      const prevScheduleDay =
        appointment.appointmenttype === "online"
          ? psychologist.onlineAppointment.schedule.find(
              (schedule) => schedule.day === prevDay
            )
          : psychologist.onsiteAppointment.schedule.find(
              (schedule) => schedule.day === prevDay
            );

      if (prevScheduleDay) {
        const prevAppointmentSlot = prevScheduleDay.slots.find(
          (slot) => slot.start === prevTime
        );

        if (prevAppointmentSlot) {
          prevAppointmentSlot.available = true;
        }
      }
      if (status === "completed") {
        psychologist.patientstreated = (psychologist.patientstreated || 0) + 1; // Increment patientstreated
        await psychologist.save();
      }
      if (status === "reschedule") {
        updateObject.reschedule_count = (appointment.reschedule_count || 0) + 1; // Increment reschedule_count

        const { day: newDay, time: newTime } = updateObject.datetime;

        const newScheduleDay =
          appointment.appointmenttype === "online"
            ? psychologist.onlineAppointment.schedule.find(
                (schedule) => schedule.day === newDay
              )
            : psychologist.onsiteAppointment.schedule.find(
                (schedule) => schedule.day === newDay
              );

        if (newScheduleDay) {
          const newAppointmentSlot = newScheduleDay.slots.find(
            (slot) => slot.start === newTime
          );

          if (newAppointmentSlot) {
            if (!newAppointmentSlot.available) {
              return res.status(400).send("Appointment slot is not available");
            }

            newAppointmentSlot.available = false;
          }
        }
        updateObject.reschedule_reason = req.body.reschedule_reason;
      }

      await psychologist.save();
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: updateObject },
      { new: true }
    );

    res.send(updatedAppointment);
    // .populate("patient_id")
    // .populate("psychologist_id", "-onlineAppointment", "-onsiteAppointment");

    // appointment.patient_id = req.body.patient_id;
    // appointment.psychologist_id = req.body.psychologist_id;
    // appointment.time = req.body.time;
    // appointment.status = req.body.status;
    // appointment.prescription = req.body.prescription;
    // appointment.notes = req.body.notes;
    // appointment.reschedule_count = appointment.reschedule_count + 1;

    // await appointment.save();

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
    const bill = await Bill.findOne({ appointmentId: req.params.id });

    if (!bill) {
      return res.status(404).send("Bill not found");
    }

    const deductionammount = (bill.amount * 10) / 90;
    console.log(bill.amount);
    console.log(deductionammount);
    let commissioncollected = await Commissioncollected.findOne();

    // decrement the commissionCollected field by 10% of the fee
    commissioncollected.ammountcollected -= deductionammount;
    await commissioncollected.save();
    await bill.remove();

    const psychologist = await Psychologist.findById(
      appointment.psychologist_id
    );
    if (!psychologist) return res.status(404).send("Psychologist not found");

    const { day: prevDay, time: prevTime } = appointment.datetime;

    const prevScheduleDay =
      appointment.appointmenttype === "online"
        ? psychologist.onlineAppointment.schedule.find(
            (schedule) => schedule.day === prevDay
          )
        : psychologist.onsiteAppointment.schedule.find(
            (schedule) => schedule.day === prevDay
          );

    if (prevScheduleDay) {
      const prevAppointmentSlot = prevScheduleDay.slots.find(
        (slot) => slot.start === prevTime
      );

      if (prevAppointmentSlot) {
        prevAppointmentSlot.available = true;
        await psychologist.save();
      }
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
    })
      .populate({
        path: "patient_id",
        populate: {
          path: "user_id",
          select: "name email",
        },
      })
      .populate({
        path: "review_id",
        match: { $expr: { $ne: ["$review_id", null] } },
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
    })
      .populate({
        path: "psychologist_id",
        select: "-onlineAppointment -onsiteAppointment",
        populate: {
          path: "user_id",
          select: "name email",
        },
      })
      .populate({
        path: "review_id",
        match: { $expr: { $ne: ["$review_id", null] } },
      });
    res.send(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
router.get("/recent-appointment/:patientId", async (req, res) => {
  const { patientId } = req.params;

  try {
    const mostRecentAppointment = await Appointment.findOne({
      patient_id: patientId,
    }).populate({
      path: "psychologist_id",
      select: "-onlineAppointment -onsiteAppointment",
      populate: {
        path: "user_id",
        select: "name email",
      },
    })
      .sort({ "datetime.date": -1 })
      .limit(1)
      .exec()
      ;

    res.status(200).json(mostRecentAppointment);
  } catch (error) {
    console.error("Error retrieving the most recent appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//get all notes for specific patient id
router.get("/notes/:patientid/:psychologistid", async (req, res) => {
  const patientId = req.params.patientid;
  const psychologistId = req.params.psychologistid;

  try {
    const result = await Appointment.aggregate([
      {
        $match: {
          psychologist_id: mongoose.Types.ObjectId(psychologistId),
          patient_id: mongoose.Types.ObjectId(patientId),
        },
      },
      {
        $sort: {
          "datetime.date": 1,
        },
      },
      {
        $group: {
          _id: "$datetime.date",
          appointments: {
            $push: {
              notes: "$notes",
              prescription: "$prescription",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          appointments: 1,
        },
      },
    ]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No appointments found for the specified patient ID" });
    }

    res.json({ appointments: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
