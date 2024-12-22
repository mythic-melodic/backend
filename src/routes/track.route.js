import express from "express";
const router = express.Router();
import TrackController from "../controller/TrackController.js";
import multer from "multer";
const upload = multer({ dest: 'uploads/' });

router.get("/all", TrackController.getAllTracks);
router.get("/disabled", TrackController.getAllTracksDisabled);
router.put("/enable/:id", TrackController.enableTrack);
router.put("/disable/:id", TrackController.disableTrack);
router.put("/update",  TrackController.updateTrack);
router.post('/add', upload.single('file'), TrackController.addTrack);
router.delete("/delete/:id", TrackController.deleteTrackById);

router.get("/:id", TrackController.getTrackById);

export default router;