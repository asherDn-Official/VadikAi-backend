const nodemailer = require("nodemailer");

exports.sendCredentials = async (email, password,  fullName = "User") => {
  //   const transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       user: process.env.EMAIL_USER,
  //       pass: process.env.EMAIL_PASS,
  //     },
  //   });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  // const mailOptions = {
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: "Your Credentials",
  //   text: `Your account is approved. Login credentials:\nEmail: ${email}\nPassword: ${password}`,
  // };
// const fullName = `${retailer.firstName} ${retailer.lastName}`;
  const mailOptions = {
    from: `"Vadik.Ai" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Hello ${fullName}, Your Account Has Been Approved - Login Credentials`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color:rgb(239, 40, 222);">Welcome to Vadik.Ai</h2>
          <p>Dear User,</p>
          <p>We’re excited to let you know that your account has been approved. You can now log in using the credentials below:</p>
          <table style="margin-top: 15px; margin-bottom: 15px;">
            <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
            <tr><td><strong>Password:</strong></td><td>${password}</td></tr>
          </table>
          <p>We recommend changing your password after your first login for security purposes.</p>
          <p style="margin-top: 20px;">Best regards,<br/>Vadik.Ai Team</p>
        </div>
        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
          If you did not expect this email, please contact our support team.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
