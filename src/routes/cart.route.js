import express from "express";
const router = express.Router();
import tokenMiddleware from "../middlewares/token.middleware.js";
import CartController from "../controller/CartController.js";

// Define more specific routes before general routes
router.get("/:id", CartController.getCartByUserId);
router.put("/update", CartController.updateCartQuantity);
router.delete("/delete", CartController.deleteCartItem);
router.post("/add", CartController.addToCart);
export default router;