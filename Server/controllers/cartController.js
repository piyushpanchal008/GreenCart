
import User from "../models/User.js"
//update use cart data : /api/cart/update
export const updateCart=async(req,res)=>{
     try {
        const {CartItems} = req.body
        const userId = req.user.id;
        await User.findByIdAndUpdate(userId,{CartItems})
        res.json({success:true,message:"Cart Updated"})

     } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
     }
}