var mongoose = require("mongoose");
const Joi = require("@hapi/joi");
var productSchema = mongoose.Schema({
  moviename: String,
  description: String,
  releasedate: String,
  ratings: Number,
  episodes: Number,
  videolink: String,
  posterlink: String,
});
var Webseries = mongoose.model("Webseries", productSchema);

function validateWebseries(data) {
  const schema = Joi.object({
    webseriesname: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(3).max(100).required(),
    releasedate: Joi.string().min(3).max(100).required(),
    rating: Joi.number().min(0).required(),
    episodes: Joi.number().min(0).required(),
    videolink: Joi.string().min(3).max(100).required(),
    posterlink: Joi.string().min(3).max(100).required(),
});
  return schema.validate(data, { abortEarly: false });
}
module.exports.Webseries = Webseries;
module.exports.validate = validateWebseries;
