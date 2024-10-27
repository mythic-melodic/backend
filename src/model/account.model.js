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
    

            callback(null, { auth: true, token: token });
        } catch (error) {
            console.error('Login error:', error);
            callback('An error occurred during login');
        }
    },
    
    
    signup: async (username, password, email, display_name, callback) => {
        const user_role = 'user';
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
            return callback(null, 'User created');
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
    }
    
}
export default AccountModel;