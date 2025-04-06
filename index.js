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
import matchRoutes from "./src/routes/match.route.js";
import betRoutes from "./src/routes/bet.route.js";



//Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/bets", betRoutes);



//Server start
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
