import pool from "../config/db.connect.js";

const PlayListModel = {
  createPlayList: async (name, creator_id, cover, description, callback) => {
    try {
            const query = `
        INSERT INTO playlists (name, creator_id, cover, description, date_created, date_modified) 
        VALUES (?, ?, ?, ?, NOW(), NOW());
      `;

      const [result] = await pool.query(query, [name, creator_id, cover, description]);
      const playlist_id = result.insertId; // MySQL's last inserted ID

            return callback(null,  { message: "Playlist created", playlist_id: playlist_id });
          } catch (error) {
            return callback(error);
          }
        },

  getAllPlaylists: async (callback) => {
    try {
      const query = `SELECT * FROM playlists`;
      const [result] = await pool.query(query);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  getPlaylistById: async (playlist_id, callback) => {
    try {
      const query = `SELECT * FROM playlists WHERE id = ?`;
      const [result] = await pool.query(query, [playlist_id]);
      // console.log('Result:', result);
      if (result.length === 0) {
        return callback("Playlist not found");
      }
      return callback(null, result);
    } catch (error) {
      console.error("Error getting playlist by ID:", error);
      return callback(error);
    }
  },

  getAllPlaylistsByCreator: async (creator_id, callback) => {
    try {
      const query = `SELECT * FROM playlists WHERE creator_id = ?`;
      const [result] = await pool.query(query, [creator_id]);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  updatePlaylist: async (playlist_id, name, description, cover, callback) => {
    try {
      const query = `
        UPDATE playlists
        SET name = ?, description = ?, cover = ?, date_modified = NOW()
        WHERE id = ?
      `;
  
      // Execute the query with the provided parameters
      const [result] = await pool.query(query, [name, description, cover, playlist_id]);
  
      // Check if any rows were affected (indicating a successful update)
      if (result.affectedRows === 0) {
        return callback(new Error("Playlist not found"));
      }
  
      // Retrieve the updated playlist's details
      const selectQuery = `
        SELECT id, name, description, cover, date_modified
        FROM playlists
        WHERE id = ?
      `;
      const [updatedPlaylist] = await pool.query(selectQuery, [playlist_id]);
  
      // Return the updated playlist details
      return callback(null, updatedPlaylist[0]);
    } catch (error) {
      // Log and return the error
      console.error("Error updating playlist:", error);
      return callback(error);
    }
  },
  

  deletePlaylist: async (playlist_id, callback) => {
    try {
      const query = `DELETE FROM playlists WHERE id = ?`;
      await pool.query(query, [playlist_id]);
      return callback(null, "Playlist deleted");
    } catch (error) {
      return callback(error);
    }
  },

  getAllTracksInPlaylist: async (playlist_id, callback) => {
    try {
      const query = `select 
        tracks.id as id,
        tracks.title as track_title,
        playlists.name as playlist_title,
        tracks.duration as duration,
        tracks.track_url as url,
        playlist_track.track_order as orders
        from tracks
        inner join playlist_track on tracks.id = playlist_track.track_id
        inner join playlists on playlists.id = playlist_track.playlist_id
        where playlists.id = ? and track_url is not null
        order by orders asc`;
      const [tracksResult]  = await pool.query(query, [playlist_id]);
  
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
      console.error("Error getting tracks in playlist:", error);
      return callback(error);
    }
  },
  addTrackToPlaylist: async (playlist_id, track_id, callback) => {
    try {
      // First, find the next track order for the playlist
      const nextOrderQuery = `
        SELECT COALESCE(MAX(track_order), 0) + 1 AS next_track_order
        FROM playlist_track
        WHERE playlist_id = ?;
      `;
      const [nextOrderResult] = await pool.execute(nextOrderQuery, [playlist_id]);
      const nextTrackOrder = nextOrderResult[0]?.next_track_order || 1;
  
      // Insert the track into the playlist
      const insertQuery = `
        INSERT INTO playlist_track (playlist_id, track_id, track_order, added_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE added_at = NOW();
      `;
      const [insertResult] = await pool.execute(insertQuery, [
        playlist_id,
        track_id,
        nextTrackOrder,
      ]);
  
      // Check if the row was successfully inserted or updated
      if (insertResult.affectedRows === 0) {
        return callback(null, "Track already exists in the playlist");
      }
  
      // Success
      return callback(null, "Track added to playlist");
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      return callback(error);
    }
  },
  

deleteTrackFromPlaylist: async (playlist_id, track_id, callback) => {
  try {
    // Step 1: Find the `track_order` of the track being deleted
    const findOrderQuery = `SELECT track_order FROM playlist_track WHERE playlist_id = ? AND track_id = ?`;
    const [result] = await pool.query(findOrderQuery, [playlist_id, track_id]);

    // If the track to delete is found
    if (result.length > 0) {
      const trackOrder = result[0].track_order;

      // Step 2: Delete the track from the playlist
      const deleteQuery = `DELETE FROM playlist_track WHERE playlist_id = ? AND track_id = ?`;
      await pool.query(deleteQuery, [playlist_id, track_id]);

      // Step 3: Update `track_order` of subsequent tracks
      const updateOrderQuery = `
        UPDATE playlist_track
        SET track_order = track_order - 1
        WHERE playlist_id = ? AND track_order > ?
      `;
      await pool.query(updateOrderQuery, [playlist_id, trackOrder]);

      return callback(null, "Track deleted from playlist");
    } else {
      // Track not found
      return callback(null, "Track not found in playlist");
    }
  } catch (error) {
    return callback(error);
  }
  // try {
  //   const query = `DELETE FROM playlist_track WHERE playlist_id = ? AND track_id = ?`;
  //   await pool.query(query, [playlist_id, track_id]);
  //   return callback(null, "Track deleted from playlist");
  // } catch (error) {
  //   return callback(error);
  // }
},

// changeTrackOrder: async (playlist_id, song_id, new_order, callback) => {
//   try {
//     // Step 1: Get the current `track_order` of the specified track
//     const findOrderQuery = `SELECT track_order FROM playlist_track WHERE playlist_id = ? AND track_id = ?`;
//     const [result] = await pool.query(findOrderQuery, [playlist_id, song_id]);

//     // Check if the track was found
//     if (result.length === 0) {
//       return callback(null, "r in playlist");
//     }

//     const currentOrder = result[0].track_order;

//     // Step 2: Adjust `track_order` of other tracks
//     if (currentOrder < new_order) {
//       // If moving down in the order, decrement `track_order` for tracks in between
//       const decrementOrderQuery = `
//         UPDATE playlist_track
//         SET track_order = track_order - 1
//         WHERE playlist_id = ? AND track_order > ? AND track_order <= ?
//       `;
//       await pool.query(decrementOrderQuery, [playlist_id, currentOrder, new_order]);
//     } else if (currentOrder > new_order) {
//       // If moving up in the order, increment `track_order` for tracks in between
//       const incrementOrderQuery = `
//         UPDATE playlist_track
//         SET track_order = track_order + 1
//         WHERE playlist_id = ? AND track_order >= ? AND track_order < ?
//       `;
//       await pool.query(incrementOrderQuery, [playlist_id, currentOrder, new_order]);
//     }

//     // Step 3: Update the track's `track_order` to the new position
//     const updateOrderQuery = `
//       UPDATE playlist_track
//       SET track_order = ?
//       WHERE playlist_id = ? AND track_id = ?
//     `;
//     await pool.query(updateOrderQuery, [new_order, playlist_id, song_id]);

//     return callback(null, "Track order changed successfully");
//   } catch (error) {
//     return callback(error);
//   }
// },
}
  

export default PlayListModel;