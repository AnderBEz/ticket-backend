import dotenv from "dotenv";
import nodemailer from "nodemailer";


dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD    
    }

}); 

export default transporter;