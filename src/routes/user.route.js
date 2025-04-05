import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/logout", asyncHandler(logoutUser));
router.post("/refresh-token", asyncHandler(refreshAccessToken));
router.post("/change-password", asyncHandler(changePassword));
router.get("/current-user", asyncHandler(getCurrentUser));

export default router;