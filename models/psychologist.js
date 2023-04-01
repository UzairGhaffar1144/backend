const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const psychologistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  psychologist_name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  onlineAppointment: {
    fee: {
      type: Number,
      required: true,
    },
    schedule: [
      {
        day: {
          type: String,
          required: true,
        },
        slots: [
          {
            start: {
              type: String,
              required: true,
            },
            end: {
              type: String,
              required: true,
            },
            available: {
              type: Boolean,
              default: true,
            },
            notes: {
              type: String,
            },
          },
        ],
      },
    ],
  },
  onsiteAppointment: {
    fee: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    schedule: [
      {
        day: {
          type: String,
          required: true,
        },
        slots: [
          {
            start: {
              type: String,
              required: true,
            },
            end: {
              type: String,
              required: true,
            },
            available: {
              type: Boolean,
              default: true,
            },
          },
        ],
      },
    ],
  },
  approved: {
    type: Boolean,
    default: false,
  },
});
function validatePsychologist(data) {
  const schema = Joi.object({
    user_id: Joi.string().required(),
    psychologist_name: Joi.string().required(),
    specialization: Joi.string().required(),
    experience: Joi.number().required(),
    rating: Joi.number().default(0),
    onlineAppointment: Joi.object({
      fee: Joi.number().required(),
      schedule: Joi.array().items(
        Joi.object({
          day: Joi.string().required(),
          slots: Joi.array().items(
            Joi.object({
              start: Joi.string().required(),
              end: Joi.string().required(),
              available: Joi.boolean().default(true),
            })
          ),
        })
      ),
    }),
    onsiteAppointment: Joi.object({
      fee: Joi.number().required(),
      location: Joi.string().required(),
      schedule: Joi.array().items(
        Joi.object({
          day: Joi.string().required(),
          slots: Joi.array().items(
            Joi.object({
              start: Joi.string().required(),
              end: Joi.string().required(),
              available: Joi.boolean().default(true),
              notes: Joi.string().allow(null, ""),
            })
          ),
        })
      ),
    }),
    approved: Joi.boolean().default(false),
  });
  return schema.validate(data, { abortEarly: false });
}

const Psychologist = mongoose.model("Psychologist", psychologistSchema);

module.exports.Psychologist = Psychologist;
module.exports.validate = validatePsychologist;
