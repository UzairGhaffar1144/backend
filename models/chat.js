// Chat schema
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const chatSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    patientname: {
      type: String,
    },
    psychologistname: {
      type: String,
    },
  },
  { timestamps: true }
);
function validateChat(data) {
  const schema = Joi.object({
    members: Joi.array().items(Joi.string().required()).required(),
  });
  return schema.validate(data, { abortEarly: false });
}

module.exports.validate = validateChat;
const Chat = mongoose.model("Chat", chatSchema);

module.exports.Chat = Chat;

// const mongoose = require("mongoose");
// const Joi = require("@hapi/joi");

// const chatSchema = new mongoose.Schema({
//   participants: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   ],
//   messages: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Message",
//     },
//   ],
//   created: {
//     type: Date,
//     default: Date.now,
//   },
// });

// function validateChat(data) {
//   const schema = Joi.object({
//     user_id: Joi.objectId().required(),
//     title: Joi.string().required(),
//     description: Joi.string().required(),
//     comments: Joi.array().items(
//       Joi.object({
//         user_id: Joi.objectId().required(),
//         content: Joi.string().required(),
//       })
//     ),
//   });
//   return schema.validate(data, { abortEarly: false });
// }

// const Chat = mongoose.model("Chat", chatSchema);
// module.exports.validate = validateChat;
// module.exports.Chat = Chat;
