import { Router } from "express";
import {
    getNextNumber,
    checkRateAnomaly,
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    generatePdf
} from "../controller/invoice.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();
router.use(verifyJwt);

router.route("/next-number").get(getNextNumber);
router.route("/rate-check").get(checkRateAnomaly);

router.route("/")
    .get(getInvoices)
    .post(createInvoice);

router.route("/:id")
    .get(getInvoiceById)
    .put(updateInvoice);

router.route("/:id/pdf").get(generatePdf);

export default router;
