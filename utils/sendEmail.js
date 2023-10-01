import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { hashString } from "./index.js";
import Verification from "../models/emailVerification.js";

dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

let transport = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",

  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

export const sendVerificationEmail = async (user, res) => {
  const { _id, email, firstName } = user;
  const token = _id + uuidv4();

  const link = APP_URL + "users/verify/" + _id + "/" + token;

  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Email Verification",

    html: `<div style = 'font-family: Arial, sans-serif; font-size: 20px; 
        color: #333 background: rgb(2,0,36);
background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%); color:white; padding: 5px 20px;'>
        <h1 style="color: rgb(8,56,188)">Please verify your email address</h1>
        <hr>
        <h4>Hi ${firstName},</h4>
        <p>Please verify your email address so we can know that it's really you.
        <br>
        <p>This link <b>expires in 1 hour</b></p>
        <br>
        <a href=${link} style="color:#fff; padding: 14px; text-decoration:none; background-color:#000">Verify Email Address</a>
        </p>
        <div style="margin-top: 20px;">
        <h1>Best Regards</h1>
        <h1>SocialBuzz Team</h1>
        </div>
        
        </div>`,
  };

  try{
     const hashedToken = await hashString(token);

     const newVerifiedEmail = await Verification.create({
        userID: _id,
        token: hashedToken,
        createdAt: Date.now(),
        expireAt: Date.now()+ 3600000,
     });

     if(newVerifiedEmail){
        transport.sendMail(mailOptions).then(()=>{
            res.status(201).send({
                success: "PENDING",
                message:"Verification has been sent to your account. Check your email for further instructions."
            })
        })
     }

  } catch(error){
    console.log(error);
    res.status(404).json({message: "Something went wrong"});
  }
};
