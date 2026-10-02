// utils/mailer.js
import nodemailer from "nodemailer";

const transporter = process.env.RESEND_API_KEY
  ? null
  : nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE, // 'gmail'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

export const sendEmail = async (to, subject, htmlContent) => {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Resend email failed (${response.status}): ${details}`);
    }

    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};
