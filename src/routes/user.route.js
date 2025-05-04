import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser,reqMoney } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register",registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyJWT,logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password",verifyJWT,changePassword);
router.get("/current-user", verifyJWT,getCurrentUser);
router.post("/req-money",verifyJWT,reqMoney);

export default router;