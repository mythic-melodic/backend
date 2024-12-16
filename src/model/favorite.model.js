import pool from "../config/db.connect.js";

const FavoriteModel = {
    addFavorite: async (user_id, track_id, callback) => {
        try {
            const query = `
                INSERT INTO likes_user_track (user_id, track_id, liked_at) 
                VALUES ($1, $2, NOW())
            `;

            await pool.query(query, [user_id, track_id]);

            return callback(null, { message: "Favorite added", track_id: track_id });
        } catch (error) {
            return callback(error);
        }
    },
    
    getFavoriteByUser: async (user_id, limit, offset, callback) => {
        try {
            const query = `SELECT * FROM likes_user_track WHERE user_id = $1 LIMIT $2 OFFSET $3;`;
            const result = await pool.query(query, [user_id, limit, offset]);
            return callback(null, result.rows);
        } catch (error) {
            return callback(error);
        }
    },

    getFavoriteByTrack: async (track_id, callback) => {
        try {
            const query = `SELECT * FROM likes_user_track WHERE track_id = $1`;
            const result = await pool.query(query, [track_id]);
            return callback(null, result.rows, { track_id: track_id });
        } catch (error) {
            return callback(error);
        }
    },
    
    removeFavorite: async (user_id, track_id, callback) => {
        try {
            const query = `DELETE FROM likes_user_track WHERE user_id = $1 AND track_id = $2`;
            await pool.query(query, [user_id, track_id]);
            return callback(null, { message: "Favorite removed" });
        } catch (error) {
            return callback(error);
        }
    }
};

export default FavoriteModel;