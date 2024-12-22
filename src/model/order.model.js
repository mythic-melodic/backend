import pool from "../config/db.connect.js";

const OrderModel = {
  createOrderByUserId: async (
    userId,
    userName,
    phone,
    address,
    deliveryMethod = "standard"
  ) => {
    try {
      const query = `
        INSERT INTO orders (user_id, order_date, status, user_name, phone, address, delivery_method)
        VALUES (?, NOW(), 'to ship', ?, ?, ?, ?);
      `;
      const [result] = await pool.execute(query, [
        userId,
        userName,
        phone,
        address,
        deliveryMethod,
      ]);
      if (result.affectedRows === 0) {
        return null;
      }
      return result.insertId;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  addToOrderMerchandise: async (
    orderId,
    merchandiseId,
    quantity,
    priceEach
  ) => {
    try {
      const query = `
        INSERT INTO order_merchandise (order_id, merchandise_id, quantity, price_each)
        VALUES (?, ?, ?, ?);
      `;
      const [result] = await pool.execute(query, [
        orderId,
        merchandiseId,
        quantity,
        priceEach,
      ]);

      if (result.affectedRows === 0) {
        return null;
      }
      
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  getAllOrder: async () => {
    try {
      const query = `
        SELECT * 
        FROM order_merchandise
        JOIN merchandise ON merchandise_id = id
        JOIN orders AS o ON order_id = o.id
        ORDER BY o.order_date DESC;
      `;
      const [result] = await pool.execute(query);

      if (result.length === 0) {
        return null;
      }
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  getAllOrderByUserId: async (userId) => {
    try {
      const query = `
       SELECT 
        m.*, 
        om.*, 
        u.display_name AS artist_name, 
        o.*
      FROM 
          merchandise AS m
      JOIN 
          order_merchandise AS om ON om.merchandise_id = m.id
      JOIN 
          users AS u ON m.artist_id = u.id
      JOIN 
          orders AS o ON om.order_id = o.id
      WHERE 
          o.user_id = '44'
      ORDER BY 
          o.order_date DESC;
      `;
      const [result] = await pool.execute(query, [userId]);

      if (result.length === 0) {
        return null;
      }
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  getOrderDetail: async (orderId) => {
    try {
      const query = `
        SELECT * 
        FROM order_merchandise AS om
        JOIN (SELECT * FROM orders WHERE id = ?) AS o ON om.order_id = o.id
        JOIN merchandise AS m ON om.merchandise_id = m.id;
      `;
      const [result] = await pool.execute(query, [orderId]);

      if (result.length === 0) {
        return null;
      }
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      const query = `
        UPDATE orders 
        SET status = ? 
        WHERE id = ?;
      `;
      const [result] = await pool.execute(query, [status, orderId]);

      if (result.affectedRows === 0) {
        throw new Error("No order found with the provided ID");
      }

      return { success: true, message: "Order status updated successfully" };
    } catch (error) {
      throw new Error("Failed to update order status: " + error.message);
    }
  },
};

export default OrderModel;
