import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


// Email sender function
const sendLoginEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password, 
      }
    });

    await transporter.sendMail({
      from: `"GreenCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Login Notification - GreenCart',
      html: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>You just logged in to your GreenCart account.</p>
        <p>If this wasn’t you, please change your password immediately or contact support.</p>
      `
    });

    console.log("Login email sent successfully.");
  } catch (error) {
    console.error("Error sending login email:", error.message);
  }
};





//Register user
export const register = async (req,res)=>{
    try{
        const {name, email, password }=req.body;

        if(!name || !email || !password){
            return res.json({success: false, message: 'Missing Details'})
        }

        const existingUser =await User.findOne({email})

        if(existingUser){
            return res.json({success: false, message: 'User Already Exist'})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const user=await User.create({name,email,password:hashedPassword})

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET, {expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,  //prevent Javascript to acceess cookie
            secure:process.env.NODE_ENV === "production", // use secure cookies in the production
            sameSite:process.env.NODE_ENV === 'production' ? 'none' :'strict' , // csrf protection
            maxAge:7*24*60*60*1000, //cookies expiration time
        })
         // Send login email
        await sendLoginEmail(user.email, user.name);
        
        return res.json({success: true, user: {email:user.email, name:user.name}})
    }
    catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}



//login user: api/user/register

export const login = async (req,res)=>{
    try {
        const {email,password}=req.body;

        if(!email || !password){
                return res.json({success:false, message: "Email and Password are Required"});
        }
        const user=await User.findOne({email});

        if(!user){
            return res.json({success:false,message: "Invalid email or password"});
        }

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message: "Invalid email or password"});
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET, {expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,  
            secure:process.env.NODE_ENV === "production", 
            sameSite:process.env.NODE_ENV === 'production' ? 'none' :'strict' ,
            maxAge:7*24*60*60*1000,
        })

         // Send login email
        await sendLoginEmail(user.email, user.name);


        return res.json({success: true, user: {email:user.email, name:user.name}})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}


export const isAuth = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.json({ success: false, message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//logout user : /api/user/logout

export const logout=async(req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production", 
            sameSite:process.env.NODE_ENV === 'production' ? 'none' :'strict' ,
        })
        return res.json({success: true, message: "Logged Out"});
    } catch (error) {
         console.log(error.message);
        res.json({success: false, message: error.message});
    }

}