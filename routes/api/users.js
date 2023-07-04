const express = require("express");
let router = express.Router();

const { User } = require("../../models/user");
const { Psychologist } = require("../../models/psychologist");
const { Patient } = require("../../models/patient");
const { Notification } = require("../../models/notification");
const Token = require("../../models/token");
const sendEmail = require("./sendemail");

const crypto = require("crypto");

var bcrypt = require("bcryptjs"); /// to hash passwords
const _ = require("lodash"); ///// provides features to work with arrays like foreach map etc
const jwt = require("jsonwebtoken"); /// token to verify genereated token
const session = require("express-session");
const config = require("config");
const admin = require("../../middlewares/admin");

router.use(
  session({
    secret: "your-secret-key", // Change this to a secure secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set this to true if using HTTPS
      httpOnly: true,
      maxAge: 3600000, // Session expires in 1 hour
    },
  })
);
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

  const verificationtoken = await new Token({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  }).save();
  const url = `http://localhost:3000/users/${user.id}/verify/${verificationtoken.token}`;
  await sendEmail(user.email, "Verify Email", url);
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
router.get("/:id/verify/:token/", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(200).send({ message: "Verification Failed" });
    console.log(user);
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    console.log(token);
    if (!token) return res.status(200).send({ message: "Verification Failed" });

    user.verified = true;
    await user.save();
    await token.remove();

    res.status(200).send({ message: "Verification Successful" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/passwordresetlink", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email address incorrect");

  let token = await Token.findOne({ userId: user._id });

  if (!token) {
    // Create a new token if it doesn't exist
    token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
  } else {
    // Update the existing token
    token.token = crypto.randomBytes(32).toString("hex");
    await token.save();
  }

  const url = `http://localhost:3000/users/reset-password/${user._id}/${token.token}`;
  await sendEmail(user.email, "Password Reset link", url);
  res.status(200).send("Link sent to email");
});

router.post("/reset-password/:id/:token", async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findOne({ _id: req.params.id });
  if (!user) return res.status(400).send({ message: "Invalid link" });
  console.log(user);
  const token = await Token.findOne({
    userId: user._id,
    token: req.params.token,
  });
  console.log(token);
  if (!token) return res.status(400).send({ message: "Invalid link" });

  user.password = newPassword;
  await user.generateHashedPassword();
  await user.save();
  await token.remove();
  return res.status(200).send("Password reset successful");
});

router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User Not Registered");
  let isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(401).send("Invalid Password");
  const notifications = await Notification.find({ user_id: user._id });
  console.log(notifications);
  user.password = undefined;
  let token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );
  // if (user.verified == false) {
  //   return res.status(400).send("please verify account first from yur email ");
  // }

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

  const datatoReturn = {
    user: user,
    token: token,
    notifications: notifications,
  };
  console.log(datatoReturn.notifications);
  res.status(200).send(datatoReturn);
});

router.delete("/", async (req, res) => {
  const email = req.body.email;
  await User.findOneAndDelete({ email: email });

  res.send("deleted");
});

router.post("/mreset-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user based on the email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Email address incorrect");
    }

    // Generate OTP token
    const token = crypto.randomInt(1000, 9999).toString();
    // Save the token in the session
    req.session.resetToken = token;
    req.session.userId = user._id;

    // Send password reset email
    await sendEmail(user.email, "Password Reset otp", token);

    res.status(200).send("Password reset email sent");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Verify OTP token
router.post("/mverify-otp", (req, res) => {
  const { otpToken } = req.body;

  try {
    // Check if the OTP token matches the one stored in the session
    if (req.session.resetToken !== otpToken) {
      return res.status(400).send("Invalid token");
    }

    // Token verification successful
    res.status(200).send("Token verified successfully");
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update password
router.post("/mupdate-password", async (req, res) => {
  const { newPassword } = req.body;

  try {
    // Find the user based on the user ID stored in the session
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(400).send("User not found");
    }

    // Update the user's password
    user.password = newPassword;
    console.log(user.password);
    console.log(newPassword);
    await user.generateHashedPassword();
    await user.save();

    // Clear the session
    req.session.resetToken = null;
    req.session.userId = null;

    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
