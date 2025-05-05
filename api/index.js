import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "../config/db.js";
import cookieParser from "cookie-parser";

//App
const app = express();

//Database connection
connectDB();

// Middlewares
app.use(cors({credentials:true,origin:'http://localhost:5173' || "https://betly.vercel.app"}));
app.use(express.json());
app.use(cookieParser());

//route imports
import userRoutes from "../src/routes/user.route.js";
import matchRoutes from "../src/routes/match.route.js";
import betRoutes from "../src/routes/bet.route.js";



//Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/bets", betRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    return res.status(statusCode).json({
        success: false,
        message
    });
})

//Server start
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
