import { Router } from "express";
import {
    createParty,
    getParties,
    searchParties,
    getPartyById,
    updateParty,
    deleteParty
} from "../controller/party.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();
router.use(verifyJwt);

router.route("/search").get(searchParties);

router.route("/")
    .get(getParties)
    .post(createParty);

router.route("/:id")
    .get(getPartyById)
    .put(updateParty)
    .delete(deleteParty);

export default router;
