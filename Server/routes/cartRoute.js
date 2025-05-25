import mongoose from "mongoose";
import authUser from "../middlewares/authUser.js";
import { updateCart } from "../controllers/cartController.js";
import express from "express";

const cartRouter=express.Router();

cartRouter.post('/update',authUser,updateCart)

export default cartRouter;