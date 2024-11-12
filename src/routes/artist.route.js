import express from "express";
const router = express.Router();
import artistController from "../controller/ArtistController.js";

router.get("/:id/top-tracks", artistController.getTopTracks);

export default router;