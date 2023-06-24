const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: "uzairghaffar1144@gmail.com",
        pass: "kyqqptalerdaxiwa",
      },
    });

    await transporter.sendMail({
      from: "uzairghaffar1144@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
    console.log("email sent successfully");
  } catch (error) {
    console.log("email not sent!");
    console.log(error);
    return error;
  }
};
module.exports = sendEmail;
