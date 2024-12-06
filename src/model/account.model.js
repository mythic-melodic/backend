import pool from "../config/db.connect.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const AccountModel = {

    login: async (username, password, callback) => {
        try {
            const query = `SELECT * FROM users WHERE username = $1`;
            const result = await pool.query(query, [username]);
    
            // Check if user exists
            if (result.rows.length === 0) {
                return callback('Invalid username or password'); 
            }
    
            const user = result.rows[0];
    
            // Compare the provided password with the hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return callback('Invalid username or password'); 
            }
    
            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.TOKEN_SECRET_KEY,
                { expiresIn: '24h' }
            );
    

            callback(null, { auth: true, token: token , role: user.user_role, user_id: user.id});
        } catch (error) {
            console.error('Login error:', error);
            callback('An error occurred during login');
        }
    },
    
    signup: async (userData, callback) => {
        const user_role = 'user';
        const { username, display_name, email, password } = userData;
        try {
            const query = `SELECT * FROM users WHERE username = $1`;
            const user = await pool.query(query, [username]);
            if(user.rows.length > 0){
                return callback('User already exists');
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const insertQuery = `INSERT INTO users (username, display_name, email, password, user_role) VALUES ($1, $2, $3, $4, $5)`;
            await pool.query(insertQuery, [username, display_name, email, hashedPassword, user_role]);
            return callback(null, {message: 'User created successfully', success: true});
        } catch (error) {
            return error;
        }
    },
    getUserByUsername: async (username, callback) => {
        const query = `SELECT * FROM users WHERE username = $1`;
        try {
            const result = await pool.query(query, [username]);
            callback(null, result); // Pass the result to the callback
        } catch (error) {
            callback(error); // Pass the error to the callback
        }
    },
    getUserByID: async (id, callback) => {
        const query = `SELECT * FROM users WHERE id = $1`;
        try {
            const result = await pool.query(query, [id]);
            callback(null, result); // Pass the result to the callback
        } catch (error) {
            callback(error); // Pass the error to the callback
        }
    },
    getAllUsers: async (callback) => {
        const query = `SELECT * FROM users`;
        try {
            const result = await pool.query(query);
            callback(null, result); // Pass the result to the callback
        } catch (error) {
            callback(error); // Pass the error to the callback
        }
    },

    deleteUserByUsername: async (username, callback) => {
        const check = `SELECT * FROM users WHERE username = $1`;
        if(!pool.query(check, [username])){
            return callback('User not found');
        }else {
            console.log('User found');
        }
        const query = `DELETE FROM users WHERE username = $1`;
        try {
            const result = await pool.query(query, [username]);
            callback(null, result); // Pass the result to the callback
        } catch (error) {
            callback(error); // Pass the error to the callback
        }
    },
    deleteUserById: async (id, callback) => {
        const check = `SELECT * FROM users WHERE id = $1`;
        const user = await pool.query(check, [id]);
        if (user.rowCount === 0) {
            return callback('User not found');
        } else {
            // console.log('User found');
        }
    
        const deletePlaylists = `DELETE FROM playlists WHERE creator_id = $1`;
        const deleteUser = `DELETE FROM users WHERE id = $1`;
    
        try {
            await pool.query('BEGIN');
            await pool.query(deletePlaylists, [id]);
            const result = await pool.query(deleteUser, [id]);
            await pool.query('COMMIT');
            callback(null, result); // Pass the result to the callback
        } catch (error) {
            await pool.query('ROLLBACK');
            callback(error); // Pass the error to the callback
        }
    }
    
}
export default AccountModel;