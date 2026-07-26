import { Router } from "express";
import {
    createFactory,
    getFactories,
    updateFactory,
    deleteFactory
} from "../controller/factory.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();
router.use(verifyJwt);

router.route("/")
    .get(getFactories)
    .post(createFactory);

router.route("/:id")
    .put(updateFactory)
    .delete(deleteFactory);

export default router;
