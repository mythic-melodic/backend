import express from "express";
const router = express.Router();
import tokenMiddleware from "../middlewares/token.middleware.js";
import merchandiseController from "../controller/MerchandiseController.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

router.get("/", merchandiseController.getAllMerchandise);
router.get("/new-arrivals", merchandiseController.getNewArrivals);
router.post("/", tokenMiddleware.authenticateToken, upload.single("image"), merchandiseController.createMerchandise);
router.put("/:id", tokenMiddleware.authenticateToken, upload.single("image"), merchandiseController.updateMerchandise);
router.get("/:id", merchandiseController.getMerchandiseById);
router.delete("/:id", tokenMiddleware.authenticateToken, merchandiseController.deleteMerchandise);

export default router;