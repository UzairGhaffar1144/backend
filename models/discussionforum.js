const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const discussionforumSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      user_id: {
        //user who commented
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      created_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

function validateDiscussionforum(data) {
  const schema = Joi.object({
    user_id: Joi.objectId().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    comments: Joi.array().items(
      Joi.object({
        user_id: Joi.objectId().required(),
        content: Joi.string().required(),
      })
    ),
  });
  return schema.validate(data, { abortEarly: false });
}

const Discussionforum = mongoose.model(
  "Discussionforum",
  discussionforumSchema
);

module.exports.Discussionforum = Discussionforum;
module.exports.validate = validateDiscussionforum;
