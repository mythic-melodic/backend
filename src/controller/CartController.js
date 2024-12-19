import CartModel from "../model/cart.model.js";

class CartController {
    async getCartByUserId(req, res) {
        try {
          const userId = req.params.id; 
          const cartData = await CartModel.getCartById(userId); 
      
          if (!cartData || cartData.length === 0) {
            return res.status(200).json({
              success: true,
              message: "No item",
              data: [],
            });
          }
      
          return res.status(200).json({
            success: true,
            message: "Cart details fetched successfully.",
            data: cartData,
          });
        } catch (error) {
          console.error("Error fetching cart details:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch cart details.",
            error: error.message,
          });
        }
    }

    async updateCartQuantity(req, res) {
        try {
          const { userId, merchandiseId, quantity } = req.body;
          if (!userId || !merchandiseId || quantity === undefined) {
            return res.status(400).json({
              success: false,
              message: "Invalid input data.",
            });
          }
      
          const updatedCart = await CartModel.updateCartQuantity(userId, merchandiseId, quantity);
      
          if (!updatedCart) {
            return res.status(404).json({
              success: false,
              message: "Cart item not found or update failed.",
            });
          }
      
          return res.status(200).json({
            success: true,
            message: "Cart item updated successfully.",
            data: updatedCart,
          });
        } catch (error) {
          console.error("Error updating cart quantity:", error.message);
          return res.status(500).json({
            success: false,
            message: "Failed to update cart quantity.",
            error: error.message,
          });
        }
    }

    async deleteCartItem(req, res) {
        try {
            const { userId, merchandiseId } = req.body;
            if (!userId || !merchandiseId) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid input data.",
                });
            }
    
            const deletedItem = await CartModel.deleteCartItem(userId, merchandiseId);
    
            if (!deletedItem) {
                return res.status(404).json({
                    success: false,
                    message: "Cart item not found or deletion failed.",
                });
            }
  
            return res.status(200).json({
                success: true,
                message: "Cart item deleted successfully.",
                data: deletedItem,
            });
        } catch (error) {
            console.error("Error deleting cart item:", error.message);
            return res.status(500).json({
                success: false,
                message: "Failed to delete cart item.",
                error: error.message,
            });
        }
  }
  
  async addToCart(req, res) {
    try {
        const { userId, merchandiseId, quantity } = req.body;
        if (!userId || !merchandiseId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data.",
            });
        }

        const addedCartItem = await CartModel.addToCart(userId, merchandiseId, quantity);

        if (!addedCartItem) {
            return res.status(404).json({
                success: false,
                message: "Failed to add or update cart item.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cart item added/updated successfully.",
            data: addedCartItem,
        });
    } catch (error) {
        console.error("Error adding to cart:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to add/update cart item.",
            error: error.message,
        });
    }
  }
}

export default new CartController();
