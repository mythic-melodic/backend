import ArtistController from "../controller/ArtistController.js";
import express from "express";
const router = express.Router();
import multer from "multer";
const upload = multer({ dest: 'uploads/' });


router.post('/create', ArtistController.create);
router.get('/all', ArtistController.getAllArtist);
router.post('/add-album', upload.single('cover'), ArtistController.addAlbum);
router.put('/approve-track', ArtistController.approveCollaboration);
router.put('/reject-track', ArtistController.rejectCollaboration);
router.get("/pending/:id", ArtistController.getAllTracksPending);
router.get('/:id/albums', ArtistController.getAlbums);
router.get("/:id/top-tracks", ArtistController.getTopTracks);
router.get('/:id', ArtistController.getById);

export default router;