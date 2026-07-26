import { Router } from "express";
import passport from "passport";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken
} from "../controller/auth.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/me").get(verifyJwt, getCurrentUser);
router.route("/refresh").post(refreshAccessToken);

// Google OAuth routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
        try {
            const user = req.user;
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

            const options = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            };

            const rawFrontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.CORS || "http://localhost:5173";
            const frontendUrl = rawFrontendUrl.replace(/\/+$/, "");

            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .redirect(`${frontendUrl}/?token=${accessToken}`);
        } catch (error) {
            console.error("Google Auth Callback Error:", error);
            const rawFrontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.CORS || "http://localhost:5173";
            const frontendUrl = rawFrontendUrl.replace(/\/+$/, "");
            return res.redirect(`${frontendUrl}/login?error=OAuthFailed`);
        }
    }
);

export default router;
