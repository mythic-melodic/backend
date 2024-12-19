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
            VALUES ($1, NOW(), 'to ship', $2, $3, $4, $5)
            RETURNING *;
          `;
      const result = await pool.query(query, [
        userId,
        userName,
        phone,
        address,
        deliveryMethod,
      ]);

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
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
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;
      const result = await pool.query(query, [
        orderId,
        merchandiseId,
        quantity,
        priceEach,
      ]);

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },
  getAllOrder: async () => {
    try {
      const query = `
              SELECT * 
              FROM 
                  order_merchandise
              JOIN merchandise 
                  ON merchandise_id = id
              JOIN orders AS o 
                  ON order_id = o.id
              ORDER BY o.order_date DESC;
          `;
      const result = await pool.query(query);

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },
  getAllOrderByUserId: async (userId) => {
    try {
      const query = `
              SELECT * 
              FROM 
                  (SELECT * FROM order_merchandise
                      JOIN merchandise ON merchandise_id = id) AS v1
                  JOIN 
                  (SELECT * FROM orders WHERE user_id = $1) AS v2
              ON v1.order_id = v2.id;
          `;
      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },
  getOrderDetail: async (orderId) => {
    try {
      const query = `
        SELECT * 
        FROM order_merchandise AS om
        JOIN (
            SELECT * 
            FROM orders 
            WHERE id = $1
        ) AS o 
        ON om.order_id = o.id
        JOIN merchandise AS m 
        ON om.merchandise_id = m.id;
      `;
      const result = await pool.query(query, [orderId]);

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      const query = `
        UPDATE orders 
        SET status = $2 
        WHERE id = $1
      `;
      const result = await pool.query(query, [orderId, status]);
      if (result.rowCount === 0) {
        throw new Error("No order found with the provided ID");
      }

      return { success: true, message: "Order status updated successfully" };
    } catch (error) {
      throw new Error("Failed to update order status: " + error.message);
    }
  },
};
export default OrderModel;
