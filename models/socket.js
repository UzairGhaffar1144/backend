// Message schema

const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const usersocketSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  socketId: {
    type: String,
  },
});

function validateSocket(data) {
  const schema = Joi.object({
    userId: Joi.string().required(),
    socketId: Joi.string().required(),
  });
  return schema.validate(data, { abortEarly: false });
}

module.exports.validate = validateSocket;
const UserSocket = mongoose.model("UserSocket", usersocketSchema);

module.exports.UserSocket = UserSocket;
