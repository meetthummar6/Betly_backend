import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
   },
   balance: {
    type: Number,
    default: 1500
  },
  refreshToken: {
    type: String
}
},
{
    timestamps: true
}
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id, username: this.username, email: this.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id, username: this.username, email: this.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const User = mongoose.model("User", userSchema);