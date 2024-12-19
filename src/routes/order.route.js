import express from "express";
const router = express.Router();
import tokenMiddleware from "../middlewares/token.middleware.js";
import OrderController from "../controller/OrderController.js";

router.post("/create", OrderController.CreateOrderByUserId);
router.post("/add", OrderController.addToOrderMerchandise);
router.get("/all/:user_id", OrderController.getAllOrderByUserId);
router.get("/all", OrderController.getAllOrder);
router.get("/:id", OrderController.getOrderDetail);
router.put("/update-status/:orderId", OrderController.updateStatus);
export default router;
