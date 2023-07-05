const express = require("express");
const router = express.Router();
var { Discussionforum } = require("../../models/discussionforum");
var { User } = require("../../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const validateDiscussionforum = require("../../middlewares/validateDiscussionforum");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");
const { filter } = require("lodash");

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

// GET all discussion forum topics by pagination and category filter
router.get("/", async (req, res) => {
  try {
    let page = Number(req.query.page ? req.query.page : 1);
    let perPage = Number(req.query.perPage ? req.query.perPage : 3);
    let skipRecords = perPage * (page - 1);

    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};
    const filters = {
      ...categoryFilter,
    };

    const discussionforums = await Discussionforum.find(filters)
      .skip(skipRecords)
      .limit(perPage)
      .populate("user_id", "-password")
      .populate({
        path: "comments.user_id",
        select: "-_id name",
      })
      .sort({ createdAt: -1 })
      .exec();
    res.send(discussionforums);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET a specific discussion forum by ID
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

// user update discussion forum
router.put("/:id", async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const updateObject = {};
    for (const [key, value] of Object.entries(req.body)) {
      updateObject[key] = value;
    }
    const updatedDiscussionforum = await Discussionforum.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateObject,
      },
      { new: true }
    );

    if (!updatedDiscussionforum) {
      return res.status(404).json({ msg: "Discussion forum not found" });
    }

    res.json(updatedDiscussionforum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// POST a comment to a discussion forum topic
router.put("/comment/:id", async (req, res) => {
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
