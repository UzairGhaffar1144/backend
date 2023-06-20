const express = require("express");
const router = express.Router();
var { Discussionforum } = require("../../models/discussionforum");
var { User } = require("../../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const validateDiscussionforum = require("../../middlewares/validateDiscussionforum");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");

// POST a new discussion forum topic
router.post("/", async (req, res) => {
  //auth to be added
  try {
    const { title, description, user_id, category } = req.body;
    const discussionforum = new Discussionforum({
      user_id,
      title,
      description,
      category,
    });
    await discussionforum.save();
    res.send(discussionforum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET all discussion forum topics
router.get("/", async (req, res) => {
  try {
    const discussionforums = await Discussionforum.find().populate("user_id");
    res.send(discussionforums);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET a specific discussion forum topic by ID
router.get("/:id", async (req, res) => {
  try {
    const discussionforum = await Discussionforum.findById(
      req.params.id
    ).populate("user_id");
    if (!discussionforum) {
      return res.status(404).send("Discussion forum not found");
    }
    res.send(discussionforum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// POST a comment to a discussion forum topic
router.put("/:id", async (req, res) => {
  try {
    const { user_id, content } = req.body;
    const { id } = req.params;

    // Find the discussion forum by ID
    const discussionforum = await Discussionforum.findById(id);

    if (!discussionforum) {
      return res.status(404).send("Discussion forum not found");
    }

    // Create a new comment object
    const newComment = {
      user_id,
      content,
      created_at: new Date(),
    };

    // Push the new comment to the comments array
    discussionforum.comments.push(newComment);

    // Save the updated discussion forum
    await discussionforum.save();

    res.status(200).send(discussionforum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Delete a discussion forum topic
router.delete("/:id", async (req, res) => {
  try {
    const discussionforum = await Discussionforum.findById(req.params.id);
    if (!discussionforum) {
      return res.status(404).send("Discussion forum not found");
    }
    await discussionforum.remove();
    res.status(200).send("Discussion forum post has been deleted");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
