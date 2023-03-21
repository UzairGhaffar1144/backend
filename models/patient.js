const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
// const { string, required,date, } = require("@hapi/joi");

const patientSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  patient_name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  occupation: {
    type: String,
  },
  contact_number: {
    type: String,
    required: true,
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
    patient_name: Joi.string().min(3).max(30).required(),
    age: Joi.number().required(),
    gender: Joi.string().valid("Male", "Female", "Other").required(),
    occupation: Joi.string().allow(""),
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
