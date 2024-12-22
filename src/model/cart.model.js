import pool from "../config/db.connect.js";

const CartModel = {
  getCartById: async (userId) => {
    try {
      const query = `
        SELECT 
              m.*, 
              a.*, 
              u.display_name AS artist_name
          FROM 
              merchandise AS m
          JOIN 
              adds_to_cart_user_merchandises AS a
              ON a.merchandise_id = m.id
          JOIN 
              users AS u
              ON m.artist_id = u.id
          WHERE 
              a.user_id = ?;

      `;
      const [rows] = await pool.execute(query, [userId]);

      if (rows.length === 0) {
        return null;
      }

      return rows;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  updateCartQuantity: async (userId, merchandiseId, quantity) => {
    try {
      const query = `
        UPDATE adds_to_cart_user_merchandises
        SET quantity = ?
        WHERE user_id = ? AND merchandise_id = ?
        LIMIT 1;
      `;
      const [result] = await pool.execute(query, [
        quantity,
        userId,
        merchandiseId,
      ]);

      if (result.affectedRows === 0) {
        return null;
      }

      return result; // Trả về kết quả cập nhật
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  deleteCartItem: async (userId, merchandiseId) => {
    try {
      const query = `
        DELETE FROM adds_to_cart_user_merchandises
        WHERE user_id = ? AND merchandise_id = ?
        LIMIT 1;
      `;
      const [result] = await pool.execute(query, [userId, merchandiseId]);

      if (result.affectedRows === 0) {
        return null;
      }

      return result; // Trả về kết quả xóa
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  addToCart: async (userId, merchandiseId, quantity) => {
    try {
      const query = `
        INSERT INTO adds_to_cart_user_merchandises (user_id, merchandise_id, quantity, added_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          quantity = quantity + VALUES(quantity),
          added_at = NOW();
      `;
      const [result] = await pool.execute(query, [
        userId,
        merchandiseId,
        quantity,
      ]);

      if (result.affectedRows === 0) {
        return null;
      }

      return result; // Trả về dòng dữ liệu đã thêm hoặc cập nhật
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },
};

export default CartModel;
