//place orderapi : /api/order/cod
import express from "express";
import { response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();



const sendOrderConfirmationEmail = async (email, name, orderId, items, amount) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const itemList = items.map(item => 
  `<li>${item.product.name} - ₹${item.product.offerPrice} x ${item.quantity}</li>`
).join('');


    await transporter.sendMail({
      from: `"GreenCart Orders" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order #${orderId} Confirmation - GreenCart`,
      html: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for your order! Here are the details:</p>
        <ul>${itemList}</ul>
        <p><strong>Total Amount:</strong> ₹${amount}</p>
        <p>Your order will be delivered soon. Thanks for shopping with GreenCart!</p>
      `
    });

    console.log("Order confirmation email sent.");
  } catch (error) {
    console.error("Error sending order email:", error.message);
  }
};

export default sendOrderConfirmationEmail;






export const PlaceOrderCOD = async (req,res)=>{
    try {
        const{items,address}=req.body;
        const userId = req.user.id;
        if(!address || items.length === 0){
            return res.json({success : false ,message :"Invalid Data"})
        }
        //calculate amount using items
        let amount = await items.reduce(async (acc,item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice*item.quantity;
        },0)
       
        //add tax 2%
        amount+=Math.floor(amount*0.02);
        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"COD",
        })

         // Get user details for email
    const user = await User.findById(userId);

    const populatedItems = await Promise.all(items.map(async (item) => {
  const product = await Product.findById(item.product);
  return {
    product: {
      name: product.name,
      offerPrice: product.offerPrice,
    },
    quantity: item.quantity,
  };
}));


    // Send order confirmation email
    await sendOrderConfirmationEmail(user.email, user.name, Order._id, populatedItems, amount);




       return res.json({success:true, message:"Order placed Successfully"})
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}

//plced order stripe: /api/order/stripe
export const PlaceOrderStripe = async (req,res)=>{
    try {
        const{items,address}=req.body;
        const {origin}=req.headers;

        const userId = req.user.id;
        if(!address || items.length === 0){
            return res.json({success : false ,message :"Invalid Data"})
        }

        let productData=[];

        //calculate amount using items
        let amount = await items.reduce(async (acc,item)=>{
            const product = await Product.findById(item.product);
            productData.push({
                name:product.name,
                price:product.offerPrice,
                quantity:item.quantity,
            });
            return (await acc) + product.offerPrice*item.quantity;
        },0)
       
        //add tax 2%
        amount+=Math.floor(amount*0.02);
       const order= await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"Online",
        })

        const user = await User.findById(userId);

    // Send order confirmation email
    await sendOrderConfirmationEmail(user.email, user.name, order._id, items, amount);

        //stripe gateway initalize;
        const stripeInstance= new stripe(process.env.STRIPE_SECRET_KEY);

        //create lineitems for stripe
        const line_items=productData.map((item)=>{
            return{
                price_data : {
                    currency :"INR",
                    product_data:{
                        name:item.name,
                    },
                    unit_amount:Math.floor(item.price +item.price * 0.02)*100
                },
                quantity:item.quantity,
            }
        })

        //create session

        const session=await stripeInstance.checkout.sessions.create({
            line_items,
            mode:"payment",
            success_url:`${origin}/loader?next=my-orders`,
            cancel_url:`${origin}/cart`,
            metadata:{
                orderId:order._id.toString(),
                userId,
            }
        })
         return res.json({success:true, url:session.url});

    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}

//Stripe webhook to verify stripe paymennt : /stripe

export const stripeWebhooks=async (request,response)=>{
 //stripe Gateway Initialization
 const stripeInstance= new stripe(process.env.STRIPE_SECRET_KEY);

 const sig = request.headers["stripe-signature"];
 let event;
 try {
    event=stripeInstance.webhooks.constructEvent(
        request.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
    );
 } catch (error) {
    response.status(400).send(`Webhook error: ${error.message}`)
 }

 //handle the event
 switch (event.type) {
    case "payment_intent.succeeded":{
        const paymentIntent =event.data.object;
        const paymentIntentId=paymentIntent.id;

        //getting session meta data;
        const session = await stripeInstance.checkout.sessions.list({
            payment_intent:paymentIntentId,

        })
        const {userId,orderId}=session.data[0].metadata;
        //mark payment as paid

        await Order.findByIdAndUpdate(orderId,{isPaid:true})

        //clear cart
        await User.findByIdAndUpdate(userId,{CartItems : {}})
        break;
    }
    case "payment_intent.payment_failed": {
        const paymentIntent =event.data.object;
        const paymentIntentId=paymentIntent.id;

        //getting session meta data;
        const session = await stripeInstance.checkout.sessions.list({
            payment_intent:paymentIntentId,

        })
        const {orderId}=session.data[0].metadata;
        await Order.findByIdAndUpdate(orderId);
        break;
    }
    default:
        console.log(`unhandled event type ${event.type}`)
        break;
 }
 response.json({received : true})

} 


//get user by userid : /api/order/user

export const getUserOrders = async (req,res)=>{
    try {
        const userId = req.user.id;
        const orders =await Order.find({
            userId,
            $or:[{paymentType : "COD"}, {isPaid:true}]
        }).populate("items.product")
        .populate("address")
        .sort({createdAt:-1});
        res.json({success:true,orders});

    } catch (error) {
        res.json({success:true,message:error.message});
    }
}

//get all order(for seller /admin) : /api/order/seller

export const getAllOrders = async (req,res)=>{
    console.log("Inside getAllOrders ✅");
    try {
       
        const orders =await Order.find({
            
            $or:[{paymentType : "COD"}, {isPaid:true}]
        }).populate("items.product").populate("address").sort({createdAt:-1});
        res.json({success:true,orders});

    } catch (error) {
        res.json({success:true,message:error.message});
    }
}