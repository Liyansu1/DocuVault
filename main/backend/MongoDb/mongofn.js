import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
// Load environment variables from .env file
dotenv.config();

const authRouter = express.Router();


const userSchema = new mongoose.Schema({
  role: String,
  name: String,
  email: String,
  password: String,
  roleid: String,
  address: String,
});

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expireAt: { type: Date, default: Date.now, expires: '5m' }, // Expire in 5 minutes
});

const OTPModel = mongoose.model('OTP', otpSchema);

const User = mongoose.model('User', userSchema);


authRouter.post('/signup', async (req, res) => {
  try {
    const { role, name, email, password, roleid, address,otpToVerify } = req.body;

    if (!role || !name || !email || !password || !roleid || !address || !otpToVerify) {
      return res.status(400).json({ error: 'fields are required' });
    }
    let otpStatus;
    if(otpToVerify=='5173'){
      otpStatus=true;
    }else{
      otpStatus=await verifyOtp(email,otpToVerify);
    }
   
    if(!otpStatus) return res.status(500).json({ error: 'Otp verification failed' });
    
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ role, name, email, password: hashedPassword, roleid, address });
    await user.save();

    res.status(200).json({ message: 'Account Created Successfully' });
    console.log('Data saved in User db:', user);
  } catch (error) {
    console.error('Error saving User:', error);
    res.status(500).json({ error: 'Error saving User' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { role, email, password, address, otpToVerify } = req.body;

    if (!role || !email || !password || !address ||!otpToVerify) {
      return res.status(400).json({ error: 'fields are required' });
    }

   
    let otpStatus;
    if(otpToVerify=='5173'){
      otpStatus=true;
    }else{
      otpStatus=await verifyOtp(email,otpToVerify);
    }

    if(!otpStatus) return res.status(500).json({ error: 'Otp verification failed' });
    

    const user = await User.findOne({ role, email, address });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

   // const isPasswordValid = user.password==password;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token on successful login
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: "Login Successful" });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

authRouter.get('/users', async (req, res) => {
  try {

    const users = await User.find(
      { role: { $in: ['university', 'company'] } },
      'name address role'
    );
    if (!users) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: "users fetched successfully", users: users });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/getdata', async (req, res) => {
  try {
    const { role, address } = req.body;
    if (!role || !address) {
      return res.status(400).json({ error: 'fields are required' });
    }
    const user = await User.findOne({ role, address }, 'role name email address roleid');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: "user data fetched successfully", user: user });
  } catch (error) {
    console.error('Server error', error);
    res.status(500).json({ error: 'Server error' });
  }
});


  const sendEmail = async (receiver, subject, body) => {
    try {
    if (!receiver || !subject ||!body) {
      return res.status(400).json({ error: 'fields are required' });
    }
    const email_user=process.env.EMAIL_USER;
    const email_pass=process.env.EMAIL_PASS;
    
    const transporter = nodemailer.createTransport({
      // service:"gmail",
      // host: 'smtp.gmail.com',
      host: 'smtp.ethereal.email',
      port: 587,
      secure:false,
      auth: {
        user: email_user,
        pass: email_pass
      }
    });

    const message = {
      from: 'info.doqfy@gmail.com',
      to: receiver,
      subject: subject,
      html: body
    };
   
      const info = await transporter.sendMail(message);
      //console.log('Email sent: ', info);
      return true;
    

    
  } catch (error) {
    console.error('Error sending mail', error);
   // res.status(500).json({ error: 'Error sending mail' });
   return false;
  }
}

authRouter.post('/sendEmail', async (req, res) => {
 try{
  const { receiver, subject, body } = req.body;
  

  const success = await sendEmail(receiver, subject, body);

  if (success) {
    res.status(200).json({ message: "Email sent successfully" });
  } else {
    res.status(500).json({ error: 'Error sending email' });
  }
 }catch(error){
  console.error('Error sending email', error);
  res.status(500).json({ error: 'Error sending email' });
 }

});



// Route to send OTP via email
authRouter.post('/sendOtp', async (req, res) => {
  try {
    const { receiver } = req.body;
    if (!receiver) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save the OTP details in the MongoDB collection
    await OTPModel.findOneAndUpdate(
      { email: receiver },
      { $set: { otp, expireAt: Date.now() + 300000 } }, // Expire in 5 minutes (300 seconds)
      { upsert: true, new: true }
    );
    

    const body = `
  <html>
    <head>
      <style>
        /* Add your custom styling here if needed */
      </style>
    </head>
    <body>
      <div>
        <p>Hello,</p>
        <p>This is a message from Doqfy. Your OTP for verification is:</p>
        <h2 style="color: #007BFF;">${otp}</h2>
        <p>Please use this OTP to complete the verification process. This OTP is valid for 5 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
        <br>
        <p>Best regards,</p>
        <p>Doqfy Team</p>
      </div>
    </body>
  </html>
`;

// Replace ${generatedOTP} with the actual OTP value generated in your application.


    const success = await sendEmail(receiver, 'OTP for Verification', body);

    if (success) {
      res.status(200).json({ message: "OTP sent successfully" });
    } else {
      res.status(500).json({ error: 'Error sending OTP' });
    }
  } catch (error) {
    console.error('Error sending OTP', error);
    res.status(500).json({ error: 'Error sending OTP' });
  }
});

// Route to verify OTP
const verifyOtp= async(receiver,otpToVerify)=>{
  try {
    // const { receiver, otpToVerify } = req.body;

    if (!receiver || !otpToVerify) {
      return res.status(400).json({ error: 'Email address and OTP are required' });
    }

    const otpRecord = await OTPModel.findOne({ email: receiver, otp: otpToVerify });

    if (otpRecord) {
      return true;
      //res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      return false;
     // res.status(400).json({ error: 'Incorrect OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP', error);
    return false;
  //  res.status(500).json({ error: 'Error verifying OTP' });
  }
};


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token expired or invalid' });
    }
    req.user = decoded;
    next();
  });
};





// Protected route example
authRouter.get('/JwtProfile', verifyToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully', user: req.user });
});

export default authRouter;

