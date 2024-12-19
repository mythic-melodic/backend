import ArtistController from "../controller/ArtistController.js";
import express from "express";
const router = express.Router();
import merchandiseController from "../controller/MerchandiseController.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
import tokenMiddleware from "../middlewares/token.middleware.js";


router.post("/create", ArtistController.create);
router.get("/all", ArtistController.getAllArtist);
router.post("/add-album", upload.single("cover"), ArtistController.addAlbum);
router.put("/approve-track", ArtistController.approveCollaboration);
router.put("/reject-track", ArtistController.rejectCollaboration);
router.get("/orders", tokenMiddleware.authenticateToken, ArtistController.getOrders);
router.get("/pending/:id", ArtistController.getAllTracksPending);
router.get("/:id/albums", ArtistController.getAlbums);
router.get("/:id/tracks", ArtistController.getAllTracks);
router.get("/:id/weekly-orders", ArtistController.getWeeklyOrders);
router.get("/:id/weekly-customers", ArtistController.getWeeklyCustomers);
router.get("/:id/weekly-sales", ArtistController.getWeeklySales);
router.get("/:id/top-tracks", ArtistController.getTopTracks);
router.get("/:id/latest-tracks", ArtistController.getLastestTracks);
router.get('/:id', ArtistController.getById);
router.get("/:id/merchandise", merchandiseController.getAllMerchandiseByArtist);

export default router;
