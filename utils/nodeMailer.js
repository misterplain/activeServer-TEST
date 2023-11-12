const nodemailer = require("nodemailer");

function nodeMailerConfirmationEmail(source, responseData) {
  console.log("NodeMailerTest triggered");
  let date = new Date();

  let smtpTransporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: `nodecronServer - ${source} - triggered at ${date}`,
    html: `
      <h3>Successful trigger at ${date}</h3>
      <h3>Source  ${source}</h3>
      ${
        responseData
          ? `<p>Response data: ${JSON.stringify(responseData)}</p>`
          : ""
      }
  
     `,
  };

  smtpTransporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Failed to send mail:", error);
    } else {
      console.log("Success email sent");
    }
  });
}

module.exports = { nodeMailerConfirmationEmail };
