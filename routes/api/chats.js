const express = require("express");
const router = express.Router();
const { Chat } = require("../../models/chat");

//post a new chat

router.post("/", async (req, res) => {
  const newChat = new Chat({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const saveChat = await newChat.save();
    res.status(200).json(saveChat);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get chat by id

router.get("/:userId", async (req, res) => {
  try {
    const chat = await Chat.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get specific chat

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const chat = await Chat.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

// // Get all chats for a user
// router.get("/chats/:userId", async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const chats = await Chat.find({
//       participants: userId,
//     })
//       .populate("participants", "username")
//       .sort("-created");
//     res.json(chats);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });

// // Get all messages for a chat
// router.get("/messages/:chatId", async (req, res) => {
//   const { chatId } = req.params;
//   try {
//     const messages = await Message.find({ chat: chatId }).populate(
//       "sender",
//       "username"
//     );
//     res.json(messages);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;
