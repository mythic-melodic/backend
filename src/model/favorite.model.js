import pool from "../config/db.connect.js";

const FavoriteModel = {
    addFavorite: async (user_id, track_id, callback) => {
        try {
            const query = `
                INSERT INTO likes_user_track (user_id, track_id, liked_at) 
                VALUES (?, ?, NOW())
            `;

            await pool.query(query, [user_id, track_id]);

            return callback(null, { message: "Favorite added", track_id: track_id });
        } catch (error) {
            return callback(error);
        }
    },
    
    getFavoriteByUser: async (user_id, limit, offset, callback) => {
        try {
            const query = `SELECT * FROM likes_user_track WHERE user_id = ? LIMIT ? OFFSET ?;`;
            const [result] = await pool.query(query, [user_id, limit, offset]);
            return callback(null, result);
        } catch (error) {
            return callback(error);
        }
    },

    getFavoriteByTrack: async (track_id, callback) => {
        try {
            const query = `SELECT * FROM likes_user_track WHERE track_id = ?`;
            const [result] = await pool.query(query, [track_id]);
            return callback(null, result, { track_id: track_id });
        } catch (error) {
            return callback(error);
        }
    },
    
    removeFavorite: async (user_id, track_id, callback) => {
        try {
            const query = `DELETE FROM likes_user_track WHERE user_id = ? AND track_id = ?`;
            await pool.query(query, [user_id, track_id]);
            return callback(null, { message: "Favorite removed" });
        } catch (error) {
            return callback(error);
        }
    }
};

export default FavoriteModel;