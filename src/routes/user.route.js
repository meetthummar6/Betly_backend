import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register",registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyJWT,logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password",verifyJWT,changePassword);
router.get("/current-user", verifyJWT,getCurrentUser);

export default router;