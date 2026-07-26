import { Router } from "express";
import {
    createItem,
    getItems,
    searchItems,
    getDistinctUnits,
    updateItem,
    deleteItem
} from "../controller/item.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();
router.use(verifyJwt);

router.route("/search").get(searchItems);
router.route("/units").get(getDistinctUnits);

router.route("/")
    .get(getItems)
    .post(createItem);

router.route("/:id")
    .put(updateItem)
    .delete(deleteItem);

export default router;
