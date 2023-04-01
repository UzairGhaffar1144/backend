const express = require("express");
const router = express.Router();
var { Discussionforum } = require("../models/discussionforum");
var { User } = require("../../models/user");

const validateDiscussionforum = require("../../middlewares/validateDiscussionforum");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");

// POST a new discussion forum topic
router.post("/", async (req, res) => {
  //auth to be added
  try {
    const { title, description, user_id } = req.body;
    const discussionForum = new Discussionforum({
      user_id,
      title,
      description,
    });
    await discussionForum.save();
    res.send(discussionForum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET all discussion forum topics
router.get("/", async (req, res) => {
  try {
    const discussionForums = await Discussionforum.find().populate("user_id");
    res.send(discussionForums);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET a specific discussion forum topic by ID
router.get("/:id", async (req, res) => {
  try {
    const discussionForum = await Discussionforum.findById(
      req.params.id
    ).populate("user_id");
    if (!discussionForum) {
      return res.status(404).send("Discussion forum not found");
    }
    res.send(discussionForum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// POST a comment to a discussion forum topic
router.post("/:id/comments", async (req, res) => {
  try {
    const { user_id, content } = req.body;
    const discussionForum = await Discussionforum.findById(req.params.id);
    if (!discussionForum) {
      return res.status(404).send("Discussion forum not found");
    }
    discussionForum.comments.push({ user_id, content });
    await discussionForum.save();
    res.status(201).send(discussionForum.comments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Delete a discussion forum topic
router.delete("/:id", async (req, res) => {
  try {
    const discussionForum = await Discussionforum.findById(req.params.id);
    if (!discussionForum) {
      return res.status(404).send("Discussion forum not found");
    }
    await discussionForum.remove();
    res.status(200).send("Discussion forum post has been deleted");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
