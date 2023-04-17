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
  degree: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  about: {
    type: String,
  },

  experience: {
    type: Number,
  },
  rating: {
    type: Number,
    default: 0,
  },
  onlineAppointment: {
    fee: {
      type: Number,
    },
    schedule: [
      {
        day: {
          type: String,
        },
        slots: [
          {
            start: {
              type: String,
            },
            end: {
              type: String,
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
  onsiteAppointment: {
    fee: {
      type: Number,
    },
    city: {
      type: String,
    },
    location: {
      type: String,
    },
    schedule: [
      {
        day: {
          type: String,
        },
        slots: [
          {
            start: {
              type: String,
              required: false,
            },
            end: {
              type: String,
              required: false,
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
    degree: Joi.string().required(),
    about: Joi.string(),
    experience: Joi.number(),
    rating: Joi.number().default(0),
    onlineAppointment: Joi.object({
      fee: Joi.number(),
      schedule: Joi.array().items(
        Joi.object({
          day: Joi.string(),
          slots: Joi.array().items(
            Joi.object({
              start: Joi.string(),
              end: Joi.string(),
              available: Joi.boolean().default(true),
            })
          ),
        })
      ),
    }),
    onsiteAppointment: Joi.object({
      fee: Joi.number(),
      location: Joi.string(),
      city: Joi.string(),
      schedule: Joi.array().items(
        Joi.object({
          day: Joi.string(),
          slots: Joi.array().items(
            Joi.object({
              start: Joi.string(),
              end: Joi.string(),
              available: Joi.boolean().default(true),
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
