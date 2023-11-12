const router = require("express").Router();
const nodemailer = require("nodemailer");

router.post("/", (req, res) => {
  const { name, email, message, phoneNum } = req.body;
  if ( message.length === 0) {
    return res.json({ msg: "Please Enter a Message!" });
  }

  let smtpTransporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  let mailOptions = {
    from: email,
    to: process.env.GMAIL_USER,
    subject: `hpNotePad - contact from ${name}`,
    html: `
    <h3>Message from ${name}</h3>
    <p>Message: ${message}</p>
   `,
  };

  smtpTransporter.sendMail(mailOptions, (error) => {
    try {
      if (error)
        return res.status(400).json({ msg: "Please Fill All The Fields!" });
      console.log("success email sent");
      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      if (error)
        return res.status(500).json({ message: "There is server error" });
    }
  });
});
module.exports = router;
