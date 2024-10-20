import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db.connect.js';

class AccountController {
    async signup(req, res) {
        const { username, display_name,  email, password, user_role } = req.body;
        try {
           // Handle signup here
        } catch (error) {
            res.status(500).send('Error: ' + error.message);
        }
    }
    async login(req, res) {
        const { username, password } = req.body;
        try{
            // Handle login here
        }
        catch(error){
            res.status(500).send('Error: ' + error.message);
        }
    }
}

export default new AccountController();
