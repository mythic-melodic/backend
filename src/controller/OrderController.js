import OrderModel from "../model/order.model.js";

class OrderController {
  async CreateOrderByUserId(req, res) {
    try {
      const {
        user_id,
        name,
        phone,
        address,
        deliveryMethod = "standard",
      } = req.body;
      if (!user_id || !name || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: "Invalid input data.",
        });
      }
      const newOrder = await OrderModel.createOrderByUserId(
        user_id,
        name,
        phone,
        address,
        deliveryMethod
      );

      if (!newOrder) {
        return res.status(400).json({
          success: false,
          message: "Failed to create order.",
        });
      }
      return res.status(201).json({
        success: true,
        message: "Order created successfully.",
        data: newOrder,
      });
    } catch (error) {
      console.error("Error creating order:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to create order.",
        error: error.message,
      });
    }
  }
  async addToOrderMerchandise(req, res) {
    try {
      const { order_id, id, quantity, price } = req.body;
      if (!order_id || !id || !quantity || !price) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid input data. Please ensure all fields are filled out.",
        });
      }

      const result = await OrderModel.addToOrderMerchandise(
        order_id,
        id,
        quantity,
        price
      );

      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Failed to add merchandise to order.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Merchandise added to order successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Error adding merchandise to order:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to add merchandise to order due to server error.",
        error: error.message,
      });
    }
  }
  async getAllOrderByUserId(req, res) {
    try {
      const user_id = req.params.user_id;
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required.",
        });
      }

      const result = await OrderModel.getAllOrderByUserId(user_id);
      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No orders found for this user.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Orders retrieved successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Error retrieving orders for user:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve orders due to server error.",
        error: error.message,
      });
    }
  }
  async getAllOrder(req, res) {
    try {
      const result = await OrderModel.getAllOrder();

      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No orders found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Orders retrieved successfully.",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve orders due to server error.",
        error: error.message,
      });
    }
  }

  async getOrderDetail(req, res) {
    try {
      const order_id = req.params.id;
      if (!order_id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required.",
        });
      }

      const result = await OrderModel.getOrderDetail(order_id);

      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No details found for this order.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Order details retrieved successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Error retrieving order details:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve order details due to server error.",
        error: error.message,
      });
    }
  }
  async updateStatus(req, res) {
    try {
      const { orderId } = req.params; 
      const { status } = req.body; 
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required.",
        });
      }

      const updateResult = await OrderModel.updateStatus(orderId, status);

      if (updateResult.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found or no changes made.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Order status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update order status.",
        error: error.message,
      });
    }
  }
}

export default new OrderController();
