import { Router } from "express";
import {
    recordPayment,
    getPayments,
    deletePayment
} from "../controller/payment.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();
router.use(verifyJwt);

router.route("/")
    .get(getPayments)
    .post(recordPayment);

router.route("/:id")
    .delete(deletePayment);

export default router;
