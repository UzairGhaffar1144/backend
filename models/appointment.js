const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const appointmentSchema = mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  psychologist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Psychologist",
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["upcoming", "completed", "cancelled"],
    default: "upcoming",
    required: true,
  },
  prescription: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

function validateAppointment(data) {
  const schema = Joi.object({
    patient_id: Joi.string().required(),
    psychologist_id: Joi.string().required(),
    time: Joi.date().required(),
    status: Joi.string()
      .valid("upcoming", "completed", "cancelled")
      .default("upcoming")
      .required(),
    prescription: Joi.string().required(),
    notes: Joi.string().required(),
  });

  return schema.validate(data, { abortEarly: false });
}

module.exports.Appointment = Appointment;
module.exports.validate = validateAppointment;
