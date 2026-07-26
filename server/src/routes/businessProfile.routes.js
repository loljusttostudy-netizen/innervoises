import { Router } from "express";
import {
    getProfile,
    updateProfile,
    uploadImageField,
    deleteImageField
} from "../controller/businessProfile.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import { upload } from "../middlewares/upload.js";

const router = Router();
router.use(verifyJwt);

router.route("/")
    .get(getProfile)
    .put(updateProfile);

router.route("/logo")
    .post(upload.single("logo"), uploadImageField("logo", "logoUrl", "logoPublicId"))
    .delete(deleteImageField("logo", "logoUrl", "logoPublicId"));

router.route("/stamp")
    .post(upload.single("stamp"), uploadImageField("stamp", "stampUrl", "stampPublicId"))
    .delete(deleteImageField("stamp", "stampUrl", "stampPublicId"));

router.route("/signature")
    .post(upload.single("signature"), uploadImageField("signature", "signatureUrl", "signaturePublicId"))
    .delete(deleteImageField("signature", "signatureUrl", "signaturePublicId"));

export default router;
