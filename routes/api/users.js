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
  return res.send(datatoReturn);
});

router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User Not Registered");
  let isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(401).send("Invalid Password");
  let token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );

  if (user.role == "psychologist") {
    let psychologist = await Psychologist.findOne({
      user_id: req.body._id,
    }).populate("user_id");
    user = psychologist; // update user object with psychologist data
  }
  if (user.role == "patient") {
    let patient = await Patient.findOne({ user_id: req.body._id }).populate(
      "user_id"
    );
    user = patient; // update user object with patient data
  }
  const datatoReturn = { user: user, token: token };
  res.status(200).send(datatoReturn);
});
module.exports = router;
