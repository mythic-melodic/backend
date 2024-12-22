import pool from "../config/db.connect.js";
import createId from "../hooks/idGenerator.js";

const TrackModel = {
  getAllTracks: async (callback) => {
    try {
      const query = `SELECT * FROM tracks WHERE track_url IS NOT NULL LIMIT 100`;
      const [result] = await pool.query(query);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  getById: async (id, callback) => {
    try {
      const trackQuery = `SELECT * FROM tracks WHERE id = ?`;
      const [trackResult] = await pool.query(trackQuery, [id]);

      if (trackResult.length === 0) {
        return callback("Track not found");
      }

      const genreQuery = `SELECT genre_id FROM track_genre WHERE track_id = ?`;
      const [genreResult] = await pool.query(genreQuery, [id]);
      const artistQuery = `SELECT users.display_name, users.username, users.id FROM user_track
      INNER JOIN users ON user_track.user_id = users.id 
      WHERE user_track.track_id = ?`;
      const [artistResult] = await pool.query(artistQuery, [id]);
      const albumQuery = `SELECT 
                        albums.id AS id,
                        tracks.title AS track_title,
                        albums.title AS album_title,
                        albums.cover AS cover
                        FROM tracks
                        INNER JOIN track_album ON tracks.id = track_album.track_id
                        INNER JOIN albums ON albums.id = track_album.album_id
                        WHERE track_id = ?`;
      const [albumResult] = await pool.query(albumQuery, [id]);
      const result = {
        track: trackResult[0],
        album: albumResult.map((row) => ({
          id: row.id,
          album_title: row.album_title,
          cover: row.cover,
        })), // Assuming multiple albums
        genre: genreResult.map((row) => row.genre_id), // Assuming multiple genres
        artists: artistResult.map((row) => ({
          display_name: row.display_name,
          username: row.username,
          id: row.id,
        })), // Assuming multiple artists
      };
      const trackInfo = {
        id: result.track.id,
        title: result.track.title,
        lyrics: result.track.lyrics,
        release_date: result.track.release_date,
        duration: result.track.duration,
        language: result.track.language,
        track_url: result.track.track_url,
        genres: result.genre.length > 0 ? result.genre : null, // If genres exist, include them, else null
        artists: result.artists.length > 0 ? result.artists : null,
        album: result.album.length > 0 ? result.album : null // If artists exist, include them, else null
      };
      return callback(null, trackInfo);
    } catch (error) {
      return callback(error);
    }
  },

  getAllTracksDisabled: async (callback) => {
    try {
      const query = `SELECT tracks.id, tracks.title, albums.cover, tracks.status, albums.artist_id
                      FROM tracks
                      INNER JOIN track_album AS t1 ON tracks.id = t1.track_id
                      INNER JOIN albums ON albums.id = t1.album_id
                      WHERE tracks.track_url IS NOT NULL AND tracks.status = 'disable'`;
      const [result] = await pool.query(query);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  enableTrack: async (id, callback) => {
    try {
      const checkCollaborator = await pool.query(
        `SELECT * FROM user_track WHERE track_id = ? AND status ='approved'`,
        [id]
      );
      if (checkCollaborator.length === 0) {
        return callback("Track not approved by collaborator");
      }
      const query = `UPDATE tracks SET status = 'public' WHERE id = ?`;
      const [result] = await pool.query(query, [id]);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  disableTrack: async (id, callback) => {
    try {
      const query = `DELETE FROM tracks WHERE id = ?`;
      const [result] = await pool.query(query, [id]);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  deleteTrackById: async (id, callback) => {
    try {
      // Begin a transaction
      await pool.query("START TRANSACTION");

      // Execute each DELETE statement with EXISTS condition
      await pool.query(
        `DELETE FROM track_album WHERE track_id = ? AND EXISTS (SELECT 1 FROM track_album WHERE track_id = ?)`,
        [id, id]
      );

      await pool.query(
        `DELETE FROM likes_user_track WHERE track_id = ? AND EXISTS (SELECT 1 FROM likes_user_track WHERE track_id = ?)`,
        [id, id]
      );

      await pool.query(
        `DELETE FROM track_genre WHERE track_id = ? AND EXISTS (SELECT 1 FROM track_genre WHERE track_id = ?)`,
        [id, id]
      );

      await pool.query(
        `DELETE FROM plays_user_track WHERE track_id = ? AND EXISTS (SELECT 1 FROM plays_user_track WHERE track_id = ?)`,
        [id, id]
      );

      await pool.query(
        `DELETE FROM playlist_track WHERE track_id = ? AND EXISTS (SELECT 1 FROM playlist_track WHERE track_id = ?)`,
        [id, id]
      );

      await pool.query(
        `DELETE FROM tracks WHERE id = ? AND EXISTS (SELECT 1 FROM tracks WHERE id = ?)`,
        [id, id]
      );

      // Commit the transaction
      await pool.query("COMMIT");

      return callback(null, { message: "Track deleted successfully" });
    } catch (error) {
      // Rollback in case of error
      await pool.query("ROLLBACK");
      return callback(error);
    }
  },

  addTrack: async (track, track_url, callback) => {
    try {
      const {
        title,
        lyrics,
        release_date,
        duration,
        language,
        user_id,
        genre,
        album,
      } = track;
      const id = createId();

      // Step 1: Check if the user exists
      const userCheckQuery = `SELECT * FROM users WHERE id = ?`;
      const [checkArtist] = await pool.query(userCheckQuery, [user_id]);

      if (checkArtist.length === 0) {
        return callback({ status: 404, message: "User not found" });
      }

      // Step 2: Validate user role
      if (checkArtist[0].user_role !== "artist") {
        return callback({ status: 403, message: "User is not an artist" });
      }

      // Step 3: Insert track into `tracks` table
      const insertTrackQuery = `
                INSERT INTO tracks (id, title, lyrics, release_date, duration, language, track_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *;
            `;
      const [trackResult] = await pool.query(insertTrackQuery, [
        id,
        title,
        lyrics,
        release_date,
        duration,
        language,
        track_url,
      ]);

      // Step 4: Insert track into `track_album` table
      const albumCheckQuery = `SELECT * FROM albums WHERE id = ?`;
      const [checkAlbum] = await pool.query(albumCheckQuery, [album]);
      if (checkAlbum.length === 0) {
        const deleteTrackQuery = `DELETE FROM tracks WHERE id = ?`;
        await pool.query(deleteTrackQuery, [trackResult[0].id]);
        return callback({ status: 404, message: "Album not found" });
      }

      const albumQuery = `
          INSERT INTO track_album (track_id, album_id) VALUES (?, ?)
      `;
      await pool.query(albumQuery, [trackResult[0].id, album]);

      // Step 5: Insert track into `track_genre` table
      for (let i = 0; i < genre.length; i++) {
        const checkGenreQuery = `SELECT * FROM genres WHERE id = ?`;
        const genreId = genre[i].toLowerCase();
        const [checkGenre] = await pool.query(checkGenreQuery, [genreId]);
        if (checkGenre.length === 0) {
          const deleteTrackQuery = `DELETE FROM tracks WHERE id = ?`;
          await pool.query(deleteTrackQuery, [trackResult[0].id]);
          const deleteAlbumQuery = `DELETE FROM track_album WHERE track_id = ?`;
          await pool.query(deleteAlbumQuery, [trackResult[0].id]);
          return callback({ status: 404, message: "Genre not found" });
        }
        const genreQuery = `
                INSERT INTO track_genre (track_id, genre_id) VALUES (?, ?)
            `;
        await pool.query(genreQuery, [trackResult[0].id, genreId]);
      }

      // Step 6: Insert track into 'user_track' table (collaborator)
      const collaborators = JSON.parse(track.collaborator);
      let sumProfit = 0;
      if (collaborators.length > 0 && collaborators[0].name !== "") {
        for (let i = 0; i < collaborators.length; i++) {
          sumProfit += parseInt(collaborators[i].profitShare, 10);
          const userCheckQuery = `SELECT * FROM users WHERE username = ?`;
          const [checkCollaborator] = await pool.query(userCheckQuery, [
            collaborators[i].name,
          ]);
          if (checkCollaborator.length === 0) {
            const deleteTrackQuery = `DELETE FROM tracks WHERE id = ?`;
            await pool.query(deleteTrackQuery, [trackResult[0].id]);
            const deleteAlbumQuery = `DELETE FROM track_album WHERE track_id = ?`;
            await pool.query(deleteAlbumQuery, [trackResult[0].id]);
            const deleteGenreQuery = `DELETE FROM track_genre WHERE track_id = ?`;
            await pool.query(deleteGenreQuery, [trackResult[0].id]);
            return callback({ status: 404, message: "Collaborator not found" });
          }
          const relateQuery = `
              INSERT INTO user_track (user_id, track_id, artist_role, profit_share) VALUES (?, ?, ?, ?)
          `;
          await pool.query(relateQuery, [
            checkCollaborator[0].id,
            trackResult[0].id,
            "collaborator",
            collaborators[i].profitShare,
          ]);
        }
      }
      const mainArtistProfit = 100 - sumProfit;
      if (mainArtistProfit < 0) {
        return callback({ status: 400, message: "Profit share is invalid" });
      }

      if (mainArtistProfit === 100) {
        const mainArtistQuery = `INSERT INTO user_track (user_id, track_id, artist_role, profit_share, status) VALUES (?, ?, ?, ?, ?)`;
        await pool.query(mainArtistQuery, [
          user_id,
          trackResult[0].id,
          "original artist",
          mainArtistProfit,
          "approved",
        ]);
        return callback(null, {
          status: 200,
          message: "Track added successfully",
          track: trackResult[0],
        });
      }
      const mainArtistQuery = `INSERT INTO user_track (user_id, track_id, artist_role, profit_share) VALUES (?, ?, ?, ?)`;
      await pool.query(mainArtistQuery, [
        user_id,
        trackResult[0].id,
        "original artist",
        mainArtistProfit,
      ]);
      return callback(null, {
        status: 200,
        message: "Track added successfully",
        track: trackResult[0],
      });
    } catch (error) {
      console.error("Error in addTrack:", error);
      return callback({ status: 500, message: "Internal server error", error });
    }
  },

  updateTrack: async (track, callback) => {
    try {
      const {
        title,
        lyrics,
        release_date,
        duration,
        language,
        genre,
        album,
      } = track;
      const id = track.track_id;

      // Step 1: Check if the track exists
      const trackCheckQuery = `SELECT * FROM tracks WHERE id = ?`;
      const [checkTrack] = await pool.query(trackCheckQuery, [id]);

      if (checkTrack.length === 0) {
        return callback({ status: 404, message: "Track not found" });
      }

      // Step 2: Update track in `tracks` table
      const updateTrackQuery = `
                UPDATE tracks 
                SET title = ?, lyrics = ?, release_date = ?, duration = ?, language = ?
                WHERE id = ?
                RETURNING *;
            `;
      const [trackResult] = await pool.query(updateTrackQuery, [
        title,
        lyrics,
        release_date,
        duration,
        language,
        id,
      ]);

      // Step 3: Update track in `track_album` table
      const updateAlbumQuery = `
                UPDATE track_album 
                SET album_id = ?
                WHERE track_id = ?;
            `;
      await pool.query(updateAlbumQuery, [album, id]);

      // Step 4: Update entries in `track_genre` table
      for (let i = 0; i < genre.length; i++) {
        const genreId = genre[i].toLowerCase();

        // Check if the combination of track_id and genre_id already exists
        const checkGenreQuery = `SELECT 1 FROM track_genre WHERE track_id = ? AND genre_id = ?`;
        const [checkGenreResult] = await pool.query(checkGenreQuery, [id, genreId]);

        if (checkGenreResult.length === 0) {
          // If it does not exist, insert a new entry
          const insertGenreQuery = `
            INSERT INTO track_genre (track_id, genre_id) VALUES (?, ?)
          `;
          await pool.query(insertGenreQuery, [id, genreId]);
        }
      }

      // Step 6: Return success response
      return callback(null, {
        status: 200,
        message: "Track updated successfully",
        track: trackResult[0],
      });
    } catch (error) {
      console.error("Error in updateTrack:", error);
      return callback({ status: 500, message: "Internal server error", error });
    }
  }
};

export default TrackModel;