import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import 'dotenv/config';
import connectDB from "./config/db.js";

//App
const app = express();

//Database connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

//route imports
import userRoutes from "./src/routes/user.route.js";



//Routes
app.use("/api/v1/users", userRoutes);


//Server start
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
