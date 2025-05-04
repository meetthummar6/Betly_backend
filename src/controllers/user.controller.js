import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get data from request
    const { username, password, email } = req.body;


    //validation
    if([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exists
    const userExists = await User.findOne({ username: username.toLowerCase() });
    const emailExists = await User.findOne({ email });

    //if user already exists
    if(userExists) {
        throw new ApiError(400, "User already exists");
    }

    //if email already exists
    if(emailExists) {
        throw new ApiError(400, "Email already exists");
    }

    //create user
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password
    });

    //find created user and remove password and refreshToken
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    //check if user was created
    if (!createdUser) {
        retun
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    )
});


const loginUser = asyncHandler(async (req, res) => {
    //get data from request
    const { username, password } = req.body;

    //validation
    if([username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    //check if user exists
    const user = await User.findOne({ username: username.toLowerCase() });
    if(!user) {
        throw new ApiError(400, "User does not exist");
    }

    //check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    //generate access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id);

    //get user without password and refreshToken
    const userWithoutPassword = await User.findById(user._id).select("-password -refreshToken");

    //define options for cookie
    const options = {
        httpOnly: true,
        secure: true,
    }

    //send response with access token, refresh token and user
    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {user: userWithoutPassword, accessToken, refreshToken}, "Login successful")
            );
});


const logoutUser = asyncHandler(async (req, res) => {
    
    await User.findOneAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 } //remove refreshToken
        },
        {
            new: true //return updated document
        }
    );

    //set options for cookie
    const options = {
        httpOnly: true,
        secure: true,
    }

    //send response
    return res
            .status(200)
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json(
                new ApiResponse(200, {}, "Logout successful")
            );
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    //get refresh token from cookie
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    //check if refresh token exists
    if(!refreshToken) {
        throw new ApiError(401, "unauthorized");
    }

    try{
        //decode refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        //check if user exists
        const user = await User.findById(decoded.id);
        if(!user) {
            throw new ApiError(401, "unauthorized");
        }

        //check if refresh token is expired
        if(user?.refreshToken !== refreshToken) {
            throw new ApiError(401, "unauthorized");
        }

        //set options for cookie
        const options = {
            httpOnly: true,
            secure: true,
        }

        //generate new access token and refresh token
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id);

        //send response
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
        
    }
    catch(error){
        throw new ApiError(401, "unauthorized");
    }
})

const changePassword = asyncHandler(async (req, res) => {
    //get data from request
    const { oldPassword, newPassword } = req.body;

    //validation
    if([oldPassword, newPassword].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    //check if user exists
    const user = await User.findById(req.user._id);
    if(!user) {
        throw new ApiError(400, "User does not exist");
    }

    //check if password is correct
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    //hash new password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    //update password
    await User.findOneAndUpdate(
        req.user._id,
        {
            $set: { password: hashPassword }
        },
        {
            new: true //return updated document
        }
    );

    //send response
    return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Password changed successfully")
            );
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const reqMoney = asyncHandler(async(req, res) => {
    if(req.user.balance > 100){
        throw new ApiError(400, "Insufficient balance");
    }
    const user = await User.findOneAndUpdate(
        req.user._id,
        {
            $inc: { balance: 5000 }
        },
        {
            new: true //return updated document
        }
    );
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "Money requested successfully"
    ))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    reqMoney
}