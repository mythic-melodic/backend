import express from "express";
const router = express.Router();
import merchandiseController from "../controller/MerchandiseController.js";
import artistController from "../controller/ArtistController.js";

router.get("/:id/top-tracks", artistController.getTopTracks);
router.get("/:id/merchandise", merchandiseController.getAllMerchandiseByArtist);

export default router;
