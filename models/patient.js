const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const patientSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  contact_number: {
    type: String,
  },
  // records:[
  //     {
  //         date:{
  //             type:Date,
  //             required:true
  //         },
  //         record:{
  //             type:String,
  //             required:true
  //         }
  //     }
  // ]
});
const Patient = mongoose.model("Patient", patientSchema);

function validatePatient(data) {
  const schema = Joi.object({
    user_id: Joi.string().required(),
    age: Joi.number().required(),
    gender: Joi.string().valid("Male", "Female", "Other").required(),
    contact_number: Joi.string().min(11).max(11).required(),
    // records: Joi.array()
    //   .items(
    //     Joi.object({
    //       date: Joi.date().required,
    //       record: Joi.string().required(),
    //     })
    //   )
    //   .required(),
  });
  return schema.validate(data, { abortEarly: false });
}
module.exports.Patient = Patient;
module.exports.validate = validatePatient;
