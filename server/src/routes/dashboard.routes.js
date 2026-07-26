import { Router } from "express";
import { getDashboardStats } from "../controller/dashboard.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();
router.use(verifyJwt);

router.route("/").get(getDashboardStats);

export default router;
