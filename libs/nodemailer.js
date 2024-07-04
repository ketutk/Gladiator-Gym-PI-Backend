// let { GOOGLE_REFRESH_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
// let { google } = require("googleapis");
// let oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
const nodemailer = require("nodemailer");
const ejs = require("ejs");
// oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
exports.sendVerifyEmail = async (userData, token) => {
  try {
    // const accessToken = await oauth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_SENDER, // Ganti dengan alamat email pengirim
        pass: process.env.PW_EMAIL_SENDER, // Ganti dengan password email pengirim
      },
    });

    let url = `${process.env.FE_URL}/verify/${token}`;
    let html = await getHTML("verification-code.ejs", { name: userData.name, password: userData.password, verify_url: url });

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: userData.email,
      subject: "Gladiator Gym - Email Verification",
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return {
      status: true,
      message: "Success to Send Email",
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.sendResetPassword = async (userData, token) => {
  try {
    // const accessToken = await oauth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_SENDER, // Ganti dengan alamat email pengirim
        pass: process.env.PW_EMAIL_SENDER, // Ganti dengan password email pengirim
      },
    });

    let url = `${process.env.FE_URL}/resetpassword/${token}`;
    let html = await getHTML("link-reset.ejs", { name: userData.name, verify_url: url });

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: userData.email,
      subject: "Gladiator Gym - Reset Password",
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return {
      status: true,
      message: "Success to Send Email",
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getHTML = (fileName, data) => {
  return new Promise((resolve, reject) => {
    const path = `${__dirname}/../views/templates/${fileName}`;
    ejs.renderFile(path, data, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};
