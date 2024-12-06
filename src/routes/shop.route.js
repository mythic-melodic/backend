import express from "express";
const router = express.Router();
import merchandiseController from "../controller/MerchandiseController.js";

router.get("/:id", merchandiseController.getAllMerchandiseByArtist);

export default router;