import express from "express";
const router = express.Router();
import tokenMiddleware from "../middlewares/token.middleware.js";
import merchandiseController from "../controller/MerchandiseController.js";

router.get("/all", merchandiseController.getAllMerchandise);
router.get("/new-arrivals", merchandiseController.getNewArrivals);
router.get("/trending-now", merchandiseController.getTrendingNow);
router.get("/fav-artist-store/:id", merchandiseController.getFavArtistStore);
router.get("/total-sold/:id", merchandiseController.getTotalSold);
router.get("/detail/:id", merchandiseController.getMerchandiseDetailById);
router.post("/create", tokenMiddleware.authenticateToken, merchandiseController.createMerchandise);
router.put("/:id", tokenMiddleware.authenticateToken, merchandiseController.updateMerchandise);
router.get("/search", merchandiseController.getMerchandiseBySearch);
router.get("/:id", merchandiseController.getMerchandiseById);
router.delete("/:id", tokenMiddleware.authenticateToken, merchandiseController.deleteMerchandise);
router.put("/update-stock/:id", merchandiseController.updateStock);
router.get("/all/:artist_id", merchandiseController.getAllMerByArtist);
router.get("/top-selling/:artist_id", merchandiseController.getTopSellingMerchandiseByArtist);



export default router;