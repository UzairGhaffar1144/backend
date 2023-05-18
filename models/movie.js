var mongoose = require("mongoose");
const Joi = require("@hapi/joi");
var productSchema = mongoose.Schema({
  moviename: String,
  description: String,
  releasedate: String,
  ratings: Number,
  videolink: String,
  posterlink: String,
});
var Movie = mongoose.model("Movie", productSchema);

function validateMovie(data) {
  const schema = Joi.object({
    moviename: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(3).max(100).required(),
    releasedate: Joi.string().min(3).max(100).required(),
    rating: Joi.number().min(0).required(),
    videolink: Joi.string().min(0).max(1000),
    posterlink: Joi.string().min(3).max(1000).required(),
});
  return schema.validate(data, { abortEarly: false });
}
module.exports.Movie = Movie;
module.exports.validate = validateMovie;
