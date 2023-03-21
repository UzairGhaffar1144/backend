const express = require("express");
let router = express.Router();
const validateWebseries = require("../../middlewares/validateWebseries");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");
var {Webseries } = require("../../models/webserie");
//get Webseriess
router.get("/", async (req, res) => {
  console.log(req.user);
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let webseriess = await Webseries.find().skip(skipRecords).limit(perPage);
  let total = await Webseries.countDocuments();
  return res.send({ total, webseriess });
});
//get single webseries
router.get("/:id", async (req, res) => {
  try {
    let webseries = await Webseries.findById(req.params.id);
    if (!webseries)
      return res.status(400).send("Webseries With given ID is not present"); //when id is not present id db
    return res.send(webseries); //everything is ok
  } catch (err) {
    return res.status(400).send("Invalid ID"); // format of id is not correct
  }
});
//update a record
router.put("/:id", validateWebseries, async (req, res) => {
  let webseries = await Webseries.findById(req.params.id);
  webseries.webseriesname = req.body.webseriesname;
  webseries.description = req.body.description;
  webseries.releasedate = req.body.releasedate;
  webseries.rating = req.body.rating;
  webseries.episodes = req.body.episodes;
  webseries.videolink = req.body.videolink;
  webseries.posterlink = req.body.posterlink;
 
  await webseries.save();
  return res.send(webseries);
});
//update a record
router.delete("/:id", async (req, res) => {
  let webseries = await Webseries.findByIdAndDelete(req.params.id);
  return res.send(webseries);
});
//Insert a record
router.post("/", validateWebseries, async (req, res) => {
  let webseries = new Webseries();
  webseries.webseriesname = req.body.webseriesname;
  webseries.description = req.body.description;
  webseries.releasedate = req.body.releasedate;
  webseries.rating = req.body.rating;
  webseries.episodes = req.body.episodes;
  webseries.videolink = req.body.videolink;
  webseries.posterlink = req.body.posterlink;
 
  await webseries.save();
  return res.send(webseries);
});
module.exports = router;
