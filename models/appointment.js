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
  review_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
  datetime: {
    time: { type: String, required: true },
    date: { type: String, required: true },
    day: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ["upcoming", "completed", "cancelled", "reschedule"],
    default: "upcoming",
  },
  reschedule_reason: {
    type: String,
  },
  prescription: {
    type: String,
  },
  notes: {
    type: String,
  },
  location: {
    type: String,
  },
  appointmenttype: {
    type: String,
    enum: ["onsite", "online"],
    required: true,
  },
  fee: {
    type: String,
    required: true,
  },
  records: {
    type: Array,
  },
  reviewed: {
    type: Boolean,
    default: false,
  },
  reschedule_count: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

function validateAppointment(data) {
  const schema = Joi.object({
    patient_id: Joi.string().required(),
    psychologist_id: Joi.string().required(),
    review_id: Joi.string(),
    time: Joi.date().required(),
    status: Joi.string()
      .valid("upcoming", "completed", "cancelled")
      .default("upcoming")
      .required(),
    prescription: Joi.string().required(),
    notes: Joi.string().required(),
    reschedule_count: Joi.number(),
    reviewed: Joi.boolean().default(false),
  });

  return schema.validate(data, { abortEarly: false });
}

module.exports.Appointment = Appointment;
module.exports.validate = validateAppointment;
