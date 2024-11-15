import pool from "../config/db.connect.js";

const TrackModel = {
    getAllTracks: async (callback) => {
        try {
            const query = `SELECT * FROM tracks limit 100`;
            const result = await pool.query(query);
            return callback(null, result.rows);
        } catch (error) {
            return callback(error);
        }
    },
    getById: async (id, callback) => {
        try {
            const query = `SELECT * FROM tracks WHERE id = $1`;
            const result = await pool.query(query, [id]);
            if (result.rows.length === 0) {
                return callback("Track not found");
            }
            return callback(null, result.rows);
        } catch (error) {
            return callback(error);
        }
    },
    deleteTrackById: async (id, callback) => {
        try {
            const check = await pool.query(`SELECT * FROM tracks WHERE id = $1`, [id]);

            if(check.rowCount === 0){
                return callback('Track not found');
            }
            const query = `DELETE FROM tracks WHERE id = $1`;
            const result = await pool.query(query, [id]);
            return callback(null, result);
        } catch (error) {
            return callback(error);
        }
    }
};
export default TrackModel;