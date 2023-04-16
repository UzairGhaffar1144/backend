// Message schema

const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const socketSchema = new mongoose.Schema({
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
const Socket = mongoose.model("Socket", socketSchema);

module.exports.Socket = Socket;
