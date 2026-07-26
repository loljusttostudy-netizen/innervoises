import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (req, res) => {
    const dbState = mongoose.connection.readyState;
    const isDbConnected = dbState === 1;

    return res.status(200).json({
        status: "OK",
        uptime: `${Math.floor(process.uptime())}s`,
        database: isDbConnected ? "connected" : "connecting/disconnected",
        timestamp: new Date().toISOString()
    });
});

export default router;
