const express = require("express");
const router = express.Router();
const { pool } = require("../database/dbinfo");

// get all movies
router.get("/get-all-movie", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(`SELECT * FROM movies`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
