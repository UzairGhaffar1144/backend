const express = require("express");
let router = express.Router();

const { User } = require("../../models/user");
const { Psychologist } = require("../../models/psychologist");
const { Patient } = require("../../models/patient");

var bcrypt = require("bcryptjs"); /// to hash passwords
const _ = require("lodash"); ///// provides features to work with arrays like foreach map etc
const jwt = require("jsonwebtoken"); /// token to verify genereated token

const config = require("config");
const admin = require("../../middlewares/admin");

router.post("/register", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User with given Email already exist");
  user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.role = req.body.role;
  await user.generateHashedPassword();
  await user.save();
  let token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );

  let datatoReturn = {
    name: user.name,
    email: user.email,
    token: token,
    role: user.role,
  };
  if (user.role == "patient") {
    const patient = new Patient({ user_id: user._id });
    await patient.save();
    datatoReturn.patient_id = patient._id;
  }
  return res.send(datatoReturn);
});

//get user
router.get("/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("user With given ID is not present"); //when id is not present id db
    return res.send(user); //everything is ok
  } catch (err) {
    return res.status(400).send("Invalid ID"); // format of id is not correct
  }
});
router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User Not Registered");
  let isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(401).send("Invalid Password");
  user.password = undefined;
  let token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );

  if (user.role == "psychologist") {
    let psychologist = await Psychologist.findOne({
      user_id: user._id,
    }).populate("user_id", "-password");
    if (psychologist) user = psychologist; // update user object with psychologist data
  } else if (user.role == "patient") {
    let patient = await Patient.findOne({ user_id: user._id }).populate(
      "user_id",
      "-password"
    );
    token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        role: user.role,
        patient_id: patient._id,
        email: user.email,
      },
      config.get("jwtPrivateKey")
    );
    user = patient;
  }
  const datatoReturn = { user: user, token: token };
  res.status(200).send(datatoReturn);
});
module.exports = router;
