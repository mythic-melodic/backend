import pool from "../config/db.connect.js";

const AlbumModel = {
    getAlbumDetails: async (albumId, callback) => {
        const query = `SELECT * FROM albums WHERE id = ?`;
        try {
            const [result] = await pool.query(query, [albumId]);
            callback(null, result[0]);
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
                    WHERE t2.status = 'approved'  AND albums.id = ? AND tracks.track_url is not null`;
        try {
            const [result] = await pool.query(query, [albumId]);
            return callback(null, result);
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
            WHERE album_id = ?`;
        try {
            const [result] = await pool.query(query, [albumId]);
            return callback(null, result);
        } catch (error) {
            return callback(error);
        }
    },

    getTracksByAlbumId: async (albumId, callback) => {
        const query = `SELECT 
                        tracks.id as id,
                        tracks.title as track_title,
                        albums.title as album_title,
                        tracks.duration as duration,
                        tracks.track_url as url,
                        track_album.track_order as orders
                        FROM tracks
                        INNER JOIN track_album ON tracks.id = track_album.track_id
                        INNER JOIN albums ON albums.id = track_album.album_id
                        WHERE albums.id = ? AND track_url is not null
                        ORDER BY orders ASC`;
        try {
            const [tracksResult] = await pool.query(query, [albumId]);
            const tracks = await Promise.all(tracksResult.map(async (track) => {
                const artistQuery = `SELECT users.display_name, users.username, users.id FROM user_track
                  INNER JOIN users ON user_track.user_id = users.id 
                  WHERE user_track.track_id = ?`;
                const [artistResult] = await pool.query(artistQuery, [track.id]);
          
                return {
                  track_title: track.track_title,
                  duration: track.duration,
                  id: track.id,
                  url: track.url,
                  orders: track.orders,
                  artists: artistResult.map((row) => ({
                    display_name: row.display_name,
                    username: row.username,
                    id: row.id,
                  })),
                };
            }));
            return callback(null, tracks);
        } catch (error) {
            return callback(error);
        }
    },

    getAlbumByID: async (albumId, callback) => {
        const query = `SELECT 
                        albums.id as id,
                        albums.title as title,
                        albums.cover as cover,
                        users.display_name as artist,
                        albums.release_date as release_date,
                        albums.description as description
                        FROM albums
                        INNER JOIN users ON albums.artist_id = users.id
                        WHERE albums.id = ?`;
        try {
            const [result] = await pool.query(query, [albumId]);
            callback(null, result);
        } catch (error) {
            return callback(error);
        }
    }
};

export default AlbumModel;