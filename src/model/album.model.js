import pool from "../config/db.connect.js";

const AlbumModel = {
    getAlbumDetails: async (albumId, callback) => {
        const query = `SELECT * FROM albums WHERE id = $1`;
        try {
            const result = await pool.query(query, [albumId]);
            callback(null, result.rows[0]);
        } catch (error) {
            return callback(error);
        }
    },

    getAllTracksInAlbum: async (albumId, callback) => {
        const query = `SELECT 
                        tracks.id AS track_id, 
                        tracks.title, 
                        albums.cover, 
                        t2.status, 
                        users.display_name AS collaborator_name, 
                        original_users.display_name AS original_artist_name,
                        t2.artist_role AS collaborator_role,
                        t1.track_order as track_order,
                        tracks.duration as duration
                    FROM tracks
                    INNER JOIN track_album AS t1 ON tracks.id = t1.track_id
                    LEFT JOIN albums ON albums.id = t1.album_id
                    INNER JOIN user_track AS t2 ON tracks.id = t2.track_id
                    JOIN users ON t2.user_id = users.id
                    LEFT JOIN user_track AS original_artist ON original_artist.track_id = tracks.id AND original_artist.artist_role = 'original artist'
                    LEFT JOIN users AS original_users ON original_artist.user_id = original_users.id
                    WHERE t2.status = 'approved' AND t2.artist_role = 'collaborator' AND albums.id = $1`;
        try {
            const result = await pool.query(query, [albumId]);
            return callback(null, result.rows);
        } catch (error) {
            return callback(error);
        }
    },

    getRelatedMerchandises: async (albumId, callback) => {
            const query = `SELECT 
                m.id, 
                m.name, 
                m.price, 
                m.image, 
                m.description, 
                m.artist_id, 
                albums.title AS album_title
            FROM merchandise AS m
            INNER JOIN albums ON m.album_id = albums.id
            WHERE album_id = $1;`;
        try {
            const result = await pool.query(query, [albumId]);
            return callback(null, result.rows);
        } catch (error) {
            return callback(error);
        }
    },

};

export default AlbumModel;