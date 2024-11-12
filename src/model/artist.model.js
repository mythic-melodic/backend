import pool from "../config/db.connect.js";

const ArtistModel = {
  getTopTracks: async (artistId, callback) => {
    const query = `SELECT tracks.id AS track_id, tracks.title AS title, COUNT(plays.track_id) AS play_count 
        FROM plays_user_track AS plays
        INNER JOIN tracks ON tracks.id = plays.track_id
        INNER JOIN uploads_user_track AS uploads ON uploads.track_id = tracks.id
        INNER JOIN users ON users.id = uploads.user_id
        WHERE users.id = $1
        GROUP BY tracks.id
        ORDER BY play_count DESC`;
    try {
      const result = await pool.query(query, [artistId]);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  },
};

export default ArtistModel;
