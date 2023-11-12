const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

// @desc    Send a collab
// @route   POST /collab
// @access  public
const sendCollab = asyncHandler(async (req, res) => {
  const { name, phoneNum, email, message } = req.body;
  console.log(req.body);

  if (email.length === 0 || message.length === 0) {
    return res
      .status(400)
      .json({ message: "Please fill in email address and message" });
  }

  let smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    port: 465,
  });
  let mailOptions = {
    from: email,
    to: process.env.GMAIL_USER,
    subject: `bcnMinimalista - contact from ${name}`,
    html: `
    <h3>Message from ${name}</h3>
    <p>Message: ${message}</p>
    <p>Phone Number: ${phoneNum}</p>`,
  };

  smtpTransport.sendMail(mailOptions, (error, response) => {
    try {
      if (error) {
        console.log(error.message);
        res.status(400).json({ message: "Error sending email" });
      } else {
        console.log(response);
        res.status(200).json({ message: "Email sent successfully" });
      }
    } catch (error) {
      if (error) return res.status(500).json({ message: error.message });
    }
  });
});

module.exports = { sendCollab };
