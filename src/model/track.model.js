import pool from "../config/db.connect.js";
import createId from "../hooks/idGenerator.js";
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
    },
    addTrack: async (track, track_url, callback) => {
        try {
            const { title, lyrics, release_date, duration, language, artist_role  } = track;
            const user_id = 8;
            // const artist_role = 'original artist';
            const id = createId();
            // Step 1: Check if the user exists
            const userCheckQuery = `SELECT * FROM users WHERE id = $1`;
            const checkArtist = await pool.query(userCheckQuery, [user_id]);
    
            if (checkArtist.rowCount === 0) {
                return callback({ status: 404, message: 'User not found' });
            }
    
            // Step 2: Validate user role
            if (checkArtist.rows[0].user_role !== 'artist') {
                return callback({ status: 403, message: 'User is not an artist' });
            }
    
            // Step 3: Insert track into `tracks` table
            const insertTrackQuery = `
                INSERT INTO tracks (id, title, lyrics, release_date, duration, language, track_url) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
            `;
            const trackResult = await pool.query(insertTrackQuery, [
                id, title, lyrics, release_date, duration, language, track_url
            ]);
    
            // Step 4: Update the `uploads_user_track` table
            const relateQuery = `
                INSERT INTO uploads_user_track (user_id, track_id, artist_role) VALUES ($1, $2, $3)
            `;
            await pool.query(relateQuery, [user_id, trackResult.rows[0].id, artist_role]);
    
            // Success response
            return callback(null, { status: 200, message: 'Track added successfully', track: trackResult.rows[0] });
        } catch (error) {
            console.error('Error in addTrack:', error);
            return callback({ status: 500, message: 'Internal server error', error });
        }
    }
    
    
};
export default TrackModel;