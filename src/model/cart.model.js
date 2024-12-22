import pool from "../config/db.connect.js";

const CartModel = {
    getCartById: async (userId) => {
        try {
          const query = 
            `SELECT * 
                FROM adds_to_cart_user_merchandises AS a
                JOIN merchandise AS m
                ON a.merchandise_id = m.id
                WHERE a.user_id = ?;`;
          const [result] = await pool.query(query, [userId]);
          if (result.length === 0) {
            return null;
          }
          return result;
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
            RETURNING *;
          `;
          const [result] = await pool.query(query, [quantity, userId, merchandiseId]);
      
          if (result.length === 0) {
            return null; // Không có dòng nào được cập nhật
          }
      
          return result[0]; // Trả về dòng dữ liệu đã cập nhật
        } catch (error) {
          throw new Error("Database query failed: " + error.message);
        }
    },

    deleteCartItem: async (userId, merchandiseId) => {
        try {
            const query = `
                DELETE FROM adds_to_cart_user_merchandises
                WHERE user_id = ? AND merchandise_id = ?
                RETURNING *;
            `;
            const [result] = await pool.query(query, [userId, merchandiseId]);
    
            if (result.length === 0) {
                return null; // Không có dòng nào bị xóa
            }
    
            return result[0]; // Trả về dòng dữ liệu đã bị xóa
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
                  quantity = adds_to_cart_user_merchandises.quantity + VALUES(quantity),
                  added_at = NOW()
              RETURNING *;
          `;
          const [result] = await pool.query(query, [userId, merchandiseId, quantity]);
  
          if (result.length === 0) {
              return null; // Không có dòng nào được xử lý
          }
  
          return result[0]; // Trả về dòng dữ liệu đã thêm hoặc cập nhật
      } catch (error) {
          throw new Error("Database query failed: " + error.message);
      }
  },
}

export default CartModel;