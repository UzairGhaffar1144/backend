const express = require("express");
const router = express.Router();
const { Appointment } = require("../../models/appointment");
const mongoose = require("mongoose");
const { Psychologist } = require("../../models/psychologist");
const { Patient } = require("../../models/patient");

// Get all reviews for a specific psychologist
router.get("/appointmentanalytics", async (req, res) => {
  try {
    const yearlyappointment = await Appointment.aggregate([
      {
        $match: {
          status: "completed", // Filter for completed appointments
        },
      },
      {
        $group: {
          _id: { $year: { $toDate: "$datetime.date" } },
          totalAppointments: { $sum: 1 },
          totalRupeesSpent: { $sum: { $toDouble: "$fee" } },
        },
      },
    ]);

    const monthlyappointments = await Appointment.aggregate([
      {
        $match: {
          status: "completed", // Filter for completed appointments
        },
      },
      {
        $group: {
          _id: { $month: { $toDate: "$datetime.date" } }, // Group by month of creation
          totalAppointments: { $sum: 1 }, // Count total appointments in each month
          totalRupeesSpent: { $sum: { $toDouble: "$fee" } }, // Calculate total rupees spent in each month
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month ascending
      },
    ]);
    const weeklyappointments = await Appointment.aggregate([
      {
        $match: {
          status: "completed", // Filter for completed appointments
        },
      },
      {
        $group: {
          _id: "$datetime.day", // Group by week
          totalAppointments: { $sum: 1 }, // Count total appointments in each week
          totalRupeesSpent: { $sum: { $toDouble: "$fee" } }, // Calculate total rupees spent in each week
        },
      },
      {
        $sort: { _id: 1 }, // Sort by week ascending
      },
    ]);

    const hourlyappointments = await Appointment.aggregate([
      {
        $match: {
          status: "completed",
          // Filter for completed appointments
        },
      },
      {
        $addFields: {
          hour: {
            $toInt: {
              $substr: ["$datetime.time", 0, 2], // Extract the hour part without the colon
            },
          },
        },
      },
      {
        $group: {
          _id: "$hour", // Group by hour
          totalAppointments: { $sum: 1 }, // Count total appointments in each hour
          totalRupeesSpent: { $sum: { $toDouble: "$fee" } }, // Calculate total rupees spent in each hour
        },
      },
      {
        $sort: { _id: 1 }, // Sort by hour ascending
      },
    ]);
    const totalPatients = await Patient.countDocuments({});
    const psychologistCounts = await Psychologist.aggregate([
      {
        $group: {
          _id: "$approved",
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract the counts for approved and not approved psychologists

    res.status(200).send({
      yearlyappointment,
      monthlyappointments,
      weeklyappointments,
      hourlyappointments,
      totalPatients,
      psychologistCounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const psychid = mongoose.Types.ObjectId(req.params.id);
    console.log(psychid);
    const yearlyappointment = await Appointment.aggregate([
      {
        $match: {
          psychologist_id: psychid,
          status: "completed", // Filter for completed appointments
        },
      },
      {
        $group: {
          _id: { $year: { $toDate: "$datetime.date" } },
          totalAppointments: { $sum: 1 },
          totalRupeesSpent: { $sum: { $toDouble: "$fee" } },
        },
      },
    ]);
    if (yearlyappointment.length == 0) {
      //means id not correct or appointment ot found
      res.send("no appointmetns found also make sure psychologist id");
    }
    const monthlyappointments = await Appointment.aggregate([
      {
        $match: {
          psychologist_id: psychid,
          status: "completed", // Filter for completed appointments
        },
      },
      {
        $group: {
          _id: { $month: { $toDate: "$datetime.date" } }, // Group by month of creation
          totalAppointments: { $sum: 1 }, // Count total appointments in each month
          totalRupeesSpent: { $sum: { $toDouble: "$fee" } }, // Calculate total rupees spent in each month
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month ascending
      },
    ]);
    const hourlyAppointments = await Appointment.aggregate([
      {
        $match: {
          psychologist_id: psychid,
          status: "completed",
          // Filter for completed appointments
        },
      },
      {
        $addFields: {
          hour: {
            $toInt: {
              $substr: ["$datetime.time", 0, 2], // Extract the hour part without the colon
            },
          },
        },
      },
      {
        $group: {
          _id: "$hour", // Group by hour
          totalAppointments: { $sum: 1 }, // Count total appointments in each hour
          totalRupeesSpent: { $sum: { $toDouble: "$fee" } }, // Calculate total rupees spent in each hour
        },
      },
      {
        $sort: { _id: 1 }, // Sort by hour ascending
      },
    ]);
    const totalPatients = await Patient.countDocuments({});
    const psychologistCounts = await Psychologist.aggregate([
      {
        $group: {
          _id: "$approved",
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract the counts for approved and not approved psychologists

    res.status(200).send({
      yearlyappointment,
      monthlyappointments,
      hourlyAppointments,
      totalPatients,
      psychologistCounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});
module.exports = router;
