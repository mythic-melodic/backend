import express from "express";
const router = express.Router();
import TrackController from "../controller/TrackController.js";

router.get("/all", TrackController.getAllTracks);
router.delete("/delete/:id", TrackController.deleteTrackById);
router.get("/:id", TrackController.getTrackById);

export default router;