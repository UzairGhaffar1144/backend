// Message schema

const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

function validateMessage(data) {
  const schema = Joi.object({
    chatId: Joi.string().required(),
    sender: Joi.string().required(),
    text: Joi.string().required(),
  });
  return schema.validate(data, { abortEarly: false });
}

module.exports.validate = validateMessage;
const Message = mongoose.model("Message", messageSchema);

module.exports.Message = Message;

// const mongoose = require("mongoose");
// const Joi = require("@hapi/joi");
// const messageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   recipient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   content: {
//     type: String,
//     required: true,
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now,
//   },
// });

// function validateMessage(data) {
//   const schema = Joi.object({
//     sender: Joi.string().alphanum().length(24).required(),
//     recipient: Joi.string().alphanum().length(24).required(),
//     content: Joi.string().required(),
//     timestamp: Joi.date().optional(),
//   });
//   return schema.validate(data, { abortEarly: false });
// }

// const Message = mongoose.model("Message", messageSchema);

// module.exports.validate = validateMessage;
// module.exports.Message = Message;
