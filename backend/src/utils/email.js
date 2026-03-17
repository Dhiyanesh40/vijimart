import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Verify Your Email - Sri Vijiyalaxmi Super Mart',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Sri Vijiyalaxmi Super Mart</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${user.fullName}!</h2>
            <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
            <p>Click the button below to verify your email:</p>
            <center>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sri Vijiyalaxmi Super Mart, Chennimalai</p>
            <p>E Raja Street, Chennimalai, Tamil Nadu - 638051</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to Sri Vijiyalaxmi Super Mart!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Sri Vijiyalaxmi Super Mart!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName},</h2>
            <p>Your email has been verified successfully!</p>
            <p>You can now enjoy all the features of our online store:</p>
            <ul>
              <li>Browse our fresh groceries and household items</li>
              <li>Add products to your cart</li>
              <li>Place orders online</li>
              <li>Track your order status</li>
              <li>Save your favorite products</li>
            </ul>
            <p>Start shopping now at: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sri Vijiyalaxmi Super Mart, Chennimalai</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
  }
};
