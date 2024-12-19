import pool from "../config/db.connect.js";

const CartModel = {
    getCartById: async (userId) => {
        try {
          const query = 
            `SELECT * 
                FROM adds_to_cart_user_merchandises AS a
                JOIN merchandise AS m
                ON a.merchandise_id = m.id
                WHERE a.user_id = $1;`;
          const result = await pool.query(query, [userId]);
          if (result.rows.length === 0) {
            return null;
          }
          return result.rows;
        } catch (error) {
          throw new Error("Database query failed: " + error.message);
        }
    },

    updateCartQuantity: async (userId, merchandiseId, quantity) => {
        try {
          const query = `
            UPDATE adds_to_cart_user_merchandises
            SET quantity = $3
            WHERE user_id = $1 AND merchandise_id = $2
            RETURNING *;
          `;
          const result = await pool.query(query, [userId, merchandiseId, quantity]);
      
          if (result.rows.length === 0) {
            return null; // Không có dòng nào được cập nhật
          }
      
          return result.rows[0]; // Trả về dòng dữ liệu đã cập nhật
        } catch (error) {
          throw new Error("Database query failed: " + error.message);
        }
    },

    deleteCartItem: async (userId, merchandiseId) => {
        try {
            const query = `
                DELETE FROM adds_to_cart_user_merchandises
                WHERE user_id = $1 AND merchandise_id = $2
                RETURNING *;
            `;
            const result = await pool.query(query, [userId, merchandiseId]);
    
            if (result.rows.length === 0) {
                return null; // Không có dòng nào bị xóa
            }
    
            return result.rows[0]; // Trả về dòng dữ liệu đã bị xóa
        } catch (error) {
            throw new Error("Database query failed: " + error.message);
        }
    },
    addToCart: async (userId, merchandiseId, quantity) => {
      try {
          const query = `
              INSERT INTO adds_to_cart_user_merchandises (user_id, merchandise_id, quantity, added_at)
              VALUES ($1, $2, $3, NOW())
              ON CONFLICT (user_id, merchandise_id)
              DO UPDATE SET 
                  quantity = adds_to_cart_user_merchandises.quantity + EXCLUDED.quantity,
                  added_at = NOW()
              RETURNING *;
          `;
          const result = await pool.query(query, [userId, merchandiseId, quantity]);
  
          if (result.rows.length === 0) {
              return null; // Không có dòng nào được xử lý
          }
  
          return result.rows[0]; // Trả về dòng dữ liệu đã thêm hoặc cập nhật
      } catch (error) {
          throw new Error("Database query failed: " + error.message);
      }
  },
  
    
}
export default CartModel