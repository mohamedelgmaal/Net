import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Verify email connection
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("Email service is ready");
    return true;
  } catch (error) {
    console.error("Email service error:", error.message);
    return false;
  }
};

// Send verification code
export const sendVerificationEmail = async (email, code) => {
  return transporter.sendMail({
    from: `"Netflix App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <div style="font-family: Arial; max-width: 500px; margin: auto; padding: 20px;">
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 8px; color: #e50914;">${code}</h1>
        <p>This code expires in 5 minutes.</p>
        <p>If you did not create an account, ignore this email.</p>
      </div>
    `,
  });
};

// Send password reset code
export const sendPasswordResetEmail = async (email, code) => {
  return transporter.sendMail({
    from: `"Netflix App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial; max-width: 500px; margin: auto; padding: 20px;">
        <h2>Password Reset</h2>
        <p>Your password reset code is:</p>
        <h1 style="letter-spacing: 8px; color: #e50914;">${code}</h1>
        <p>This code expires in 5 minutes.</p>
        <p>If you did not request a password reset, ignore this email.</p>
      </div>
    `,
  });
};