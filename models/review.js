const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const reviewSchema = mongoose.Schema({
  psychologist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Psychologist",
    required: true,
  },
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});

function validateAppointment(data) {
  const schema = Joi.object({
    psychologist: Joi.string().required(),
    appointment: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().required(),
  });

  return schema.validate(data, { abortEarly: false });
}

const Review = mongoose.model("Review", reviewSchema);
module.exports.Review = Review;
module.exports.validate = validateAppointment;
