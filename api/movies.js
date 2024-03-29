const express = require("express");
const router = express.Router();
const { pool } = require("../database/dbinfo");

// get all movies
// router.get("/get-all-movie", async (req, res) => {
//   try {
//     await pool.connect();
//     const result = await pool.request().query(`SELECT * FROM movies`);
//     const movies = result.recordset;
//     res.json({ data: movies, success: true });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

router.get("/get-all-movie-with-cat", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    // console.log(offset);
    // console.log(typeof(offset));
    const category = req.query.category;

    await pool.connect();
    const result = await pool
      .request()
      .input("category", category)
      .input("offset", offset)
      .input("limit", limit)
      .query(
        `SELECT * FROM movies WHERE category = @category ORDER BY _id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
      );

    const movies = result.recordset;
    // console.log(movies);
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies hành động
router.get("/get-top-10-movie-hanhdong", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`select top 10 * from movies where category = 'Action'`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies võ thuật
router.get("/get-top-10-movie-vothuat", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`select top 10 * from movies where category = 'Martial'`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies kinh dị
router.get("/get-top-10-movie-kinhdi", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`select top 10 * from movies where category = 'Horror'`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
