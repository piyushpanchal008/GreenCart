import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import dotenv from 'dotenv';
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWebhooks } from "./controllers/orderController.js";

dotenv.config();


const app=express();
const port= process.env.PORT || 4000 

await connectDB();
await connectCloudinary();

//Allow Multiple Origin
const allowedOrigins = ['http://localhost:5173']

app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)

//Middleware configuration
app.use(express.json());
app.use(cookieParser());
// app.use(cors({origin:allowedOrigins,credentials:true}));

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser clients or same-origin
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));


app.get('/',(req,res)=>res.send ("API is working"));

app.use('/api/user',userRouter);
app.use('/api/seller', sellerRouter );
app.use('/api/product', productRouter );
app.use('/api/cart', cartRouter );
app.use('/api/address', addressRouter );
app.use('/api/order', orderRouter );




app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})