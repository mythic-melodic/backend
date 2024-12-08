import pool from "../config/db.connect.js";

const SearchModel = {
    searchTrack: async (search_query, callback) => {
        try {
        const query = `SELECT * FROM tracks WHERE title ILIKE $1 OR artist ILIKE $1`;
        const result = await pool
            .query(query, [`%${search_query}%`]);
        return callback(null, result.rows);
        } catch (error) {
        return callback(error);
        }
    },
    searchArtist: async (search_query, callback) => {
        try {
        const query = `SELECT * FROM users WHERE display_name ILIKE $1`;
        const result = await pool
            .query(query, [`%${search_query}%`]);
        return callback(null, result.rows);
        } catch (error) {
        return callback(error);
        }
    },
    searchAlbum: async (search_query, callback) => {
        try {
        const query = `SELECT * FROM albums WHERE title ILIKE $1`;
        const result = await pool
            .query(query, [`%${search_query}%`]);
        return callback(null, result.rows);
        } catch (error) {
        return callback(error);
        }
    },

};

export default SearchModel;