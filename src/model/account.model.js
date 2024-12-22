import pool from "../config/db.connect.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const AccountModel = {
  login: async (username, password, callback) => {
    try {
      const query = `SELECT * FROM users WHERE username = ?`;
      const [rows] = await pool.query(query, [username]); // Destructure to get rows

      // Check if user exists
      if (rows.length === 0) {
        return callback("Invalid username or password");
      }

      const user = rows[0];
      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return callback("Invalid username or password");
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.TOKEN_SECRET_KEY,
        { expiresIn: "24h" }
      );

      callback(null, {
        auth: true,
        token: token,
        role: user.user_role,
        user_id: user.id,
        display_name: user.display_name,
        phone: user.phone,
        address: user.address,
        balance: user.balance,
      });
    } catch (error) {
      console.error("Login error:", error);
      callback("An error occurred during login");
    }
  },

  signup: async (userData, callback) => {
    const user_role = "user";
    const { username, display_name, email, password } = userData;
    try {
      const query = `SELECT * FROM users WHERE username = ?`;
      const [rows] = await pool.query(query, [username]);
      if (rows.length > 0) {
        return callback("User already exists");
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const insertQuery = `INSERT INTO users (username, display_name, email, password, user_role) VALUES (?, ?, ?, ?, ?)`;
      await pool.query(insertQuery, [
        username,
        display_name,
        email,
        hashedPassword,
        user_role,
      ]);
      return callback(null, {
        message: "User created successfully",
        success: true,
      });
    } catch (error) {
      return error;
    } 
  },
  getUserByUsername: async (username, callback) => {
    const query = `SELECT * FROM users WHERE username = ?`;
    try {
      const [result] = await pool.query(query, [username]);
      callback(null, result); // Pass the result to the callback
    } catch (error) {
      callback(error); // Pass the error to the callback
    }
  },
  getUserByID: async (id, callback) => {
    const query = `SELECT * FROM users WHERE id = ?`;
    try {
      const [result] = await pool.query(query, [id]);
      callback(null, result); // Pass the result to the callback
    } catch (error) {
      callback(error); // Pass the error to the callback
    }
  },
  getAllUsers: async (callback) => {
    const query = `SELECT * FROM users`;
    try {
      const [result] = await pool.query(query);
      callback(null, result); // Pass the result to the callback
    } catch (error) {
      callback(error); // Pass the error to the callback
    }
  },

  deleteUserByUsername: async (username, callback) => {
    const check = `SELECT * FROM users WHERE username = ?`;
    if (!pool.query(check, [username])) {
      return callback("User not found");
    } else {
      console.log("User found"); 
    }
    const query = `DELETE FROM users WHERE username = ?`;
    try {
      const [result] = await pool.query(query, [username]);
      callback(null, result); // Pass the result to the callback
    } catch (error) {
      callback(error); // Pass the error to the callback
    }
  },
  deleteUserById: async (id, callback) => {
    const check = `SELECT * FROM users WHERE id = ?`;
    const user = await pool.query(check, [id]);
    if (user.rowCount === 0) {
      return callback("User not found");
    } else {
      // console.log('User found');
    }

    const deletePlaylists = `DELETE FROM playlists WHERE creator_id = ?`;
    const deleteUser = `DELETE FROM users WHERE id = ?`;

    try {
      await pool.query("BEGIN");
      await pool.query(deletePlaylists, [id]);
      const result = await pool.query(deleteUser, [id]);
      await pool.query("COMMIT");
      callback(null, result); // Pass the result to the callback
    } catch (error) {
      await pool.query("ROLLBACK");
      callback(error); // Pass the error to the callback
    }
  },
  updateBalance: async (userId, newBalance) => {
    try {
      const query = `
            UPDATE users
            SET balance = $1
            WHERE id = $2
            RETURNING *;
        `;
      const result = await pool.query(query, [newBalance, userId]);

      if (result.rows.length === 0) {
        return null; // No user was updated
      }
      return result.rows[0]; // Return the updated user data
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },
  addToBalance: async (userId, amountToAdd) => {
    try {
      const query = `
            UPDATE users
            SET balance = balance + $1
            WHERE id = $2
            RETURNING *;
        `;
      const result = await pool.query(query, [amountToAdd, userId]);

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },
  updateUser: async (id, userData) => {
    const { display_name, avatar, gender, bio, date_of_birth } = userData;
    const query = `
            UPDATE users 
            SET 
                display_name = ?, 
                avatar = ?, 
                gender = ?, 
                bio = ?, 
                date_of_birth = ? 
            WHERE id = ?
            RETURNING *`; // Trả về dữ liệu sau khi cập nhật
    try {
      const [result] = await pool.query(query, [
        display_name,
        avatar,
        gender,
        bio,
        date_of_birth,
        id,
      ]);
      return result[0]; // Trả về kết quả đầu tiên
    } catch (error) {
      throw new Error(error.message); // Ném lỗi để controller xử lý
    }
  },
  changePassword: async (id, oldPassword, newPassword) => {
    const getPasswordQuery = `SELECT password FROM users WHERE id = $1`;
    const updatePasswordQuery = `UPDATE users SET password = $1 WHERE id = $2`;

    try {
      // Lấy mật khẩu hiện tại từ cơ sở dữ liệu
      const result = await pool.query(getPasswordQuery, [id]);
      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      const currentPassword = result.rows[0].password;

      // Kiểm tra oldPassword có khớp không
      const isMatch = await bcrypt.compare(oldPassword, currentPassword);
      if (!isMatch) {
        throw new Error("Old password is incorrect");
      }

      // Nếu mật khẩu khớp, băm newPassword và cập nhật
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await pool.query(updatePasswordQuery, [hashedPassword, id]);

      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
export default AccountModel;
