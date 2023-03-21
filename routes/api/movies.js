const express = require("express");
let router = express.Router();
const validateMovie = require("../../middlewares/validateMovie");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");
var { Movie } = require("../../models/movie");

//get Movies
router.get("/", async (req, res) => {
  console.log(req.user);
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let movies = await Movie.find().skip(skipRecords).limit(perPage);
  let total = await Movie.countDocuments();
  return res.send({ total, movies });
});
//get single movie
router.get("/:id", async (req, res) => {
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie)
      return res.status(400).send("Movie With given ID is not present"); //when id is not present id db
    return res.send(movie); //everything is ok
  } catch (err) {
    return res.status(400).send("Invalid ID"); // format of id is not correct
  }
});
//update a record
router.put("/:id", validateMovie, async (req, res) => {
  let movie = await Movie.findById(req.params.id);
  movie.moviename = req.body.moviename;
  movie.description = req.body.description;
  movie.releasedate = req.body.releasedate;
  movie.rating = req.body.rating;
  movie.videolink = req.body.videolink;
  movie.posterlink = req.body.posterlink;

  await movie.save();
  return res.send(movie);
});
//update a record
// router.delete("/:id", async (req, res) => {
//   let movie = await Movie.findByIdAndDelete(req.params.id);
//   return res.send(movie);
// });

router.delete("/", async (req, res) => {
  let movie = await Movie.deleteOne(req.body.moviename);
  return res.send(movie);
});
//Insert a record
router.post("/", auth, validateMovie, async (req, res) => {
  let movie = new Movie();
  movie.moviename = req.body.moviename;
  movie.description = req.body.description;
  movie.releasedate = req.body.releasedate;
  movie.rating = req.body.rating;
  movie.videolink = req.body.videolink;
  movie.posterlink = req.body.posterlink;

  await movie.save();
  return res.send(movie);
});
module.exports = router;
