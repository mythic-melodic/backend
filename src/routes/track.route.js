import express from "express";
const router = express.Router();
import TrackController from "../controller/TrackController.js";
import multer from "multer";
const upload = multer({ dest: 'uploads/' });

router.get("/all", TrackController.getAllTracks);
router.post('/add', upload.single('file'), TrackController.addTrack);
router.delete("/delete/:id", TrackController.deleteTrackById);

router.get("/:id", TrackController.getTrackById);

export default router;