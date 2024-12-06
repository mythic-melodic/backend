import express from "express";
const router = express.Router();
import tokenMiddleware from "../middlewares/token.middleware.js";
import merchandiseController from "../controller/MerchandiseController.js";

router.get("/all", merchandiseController.getAllMerchandise);
router.post("/create",tokenMiddleware.authenticateToken,merchandiseController.createMerchandise);
router.put("/:id", tokenMiddleware.authenticateToken,merchandiseController.updateMerchandise);
router.get("/:id", merchandiseController.getMerchandiseById);
router.delete("/:id",tokenMiddleware.authenticateToken, merchandiseController.deleteMerchandise);

export default router;
