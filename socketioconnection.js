const socketio = require("socket.io");
const Message = require("./models/message");
const Chat = require("./models/chat");
const UserSocket = require("./models/socket").Socket;

function socketConnection(server) {
  const io = socketio(server, {
    cors: {
      methods: ["GET", "POST"],
      transports: ["websocket"],
      credentials: true,
    },
    allowEIO3: true,
  });
  // require("socket.io")(8900, {
  //   cors: {
  //     origin: "http://localhost:3000",
  //   },
  // });

  let users = [];

  UserSocket.find({}, (err, sockets) => {
    if (err) {
      console.log(err);
    } else {
      users = sockets.map((socket) => ({
        userId: socket.userId,
        socketId: socket.socketId,
      }));
      console.log(users);
    }
  });

  // const addUser = (userId, socketId) => {
  //   !users.some((user) => user.userId === userId) &&
  //     users.push({ userId, socketId });
  // };
  const addUser = async (userId, socketId) => {
    const socket = await UserSocket.findOne({ userId });

    if (socket) {
      // update existing socket
      socket.socketId = socketId;
      // await socket.save();
    } else {
      // create new socket
      socket = new UserSocket({ userId, socketId });
      // await newSocket.save();
      // users.push({ userId, socketId });
      // add new user to the users array
    }
    await socket.save();
    const index = users.findIndex((user) => user.userId === userId);
    if (index !== -1) {
      users[index].socketId = socketId;
    } else {
      users.push({ userId, socketId });
    }
    console.log(users);

    io.emit("getUsers", users);
  };

  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };

  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };
  // const getUser = async (userId) => {
  //   const usersocket = await UserSocket.findOne({ userId });
  //   return usersocket;
  // };

  io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.");

    //take userId and socketId from user

    socket.on("addUser", (userId) => {
      // const index = users.findIndex((obj) => obj.userId === userId);

      // if (index !== -1) {
      //   users[index].socketId = socket.id;
      // } else {
      addUser(userId, socket.id);
      // }

      io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    });

    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      // removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });

  // io = socketio(server);

  // io.on("connection", (socket) => {
  //   console.log(`User connected: ${socket.id}`);

  //   // Join room on user login
  //   socket.on("login", (userId) => {
  //     console.log(`User ${userId} logged in`);
  //     socket.join(userId);
  //   });

  //   // Send message and save to database
  //   // Send message and save to database
  //   socket.on("sendMessage", async ({ senderId, recipientId, content }) => {
  //     try {
  //       // Check if chat already exists, if not create one
  //       let chatId;
  //       const existingChat = await Chat.findOne({
  //         participants: { $all: [senderId, recipientId] },
  //       });
  //       if (existingChat) {
  //         chatId = existingChat._id;
  //       } else {
  //         const newChat = new Chat({
  //           participants: [senderId, recipientId],
  //         });
  //         const savedChat = await newChat.save();
  //         chatId = savedChat._id;
  //       }

  //       // Create message and save to database
  //       const message = new Message({
  //         sender: senderId,
  //         recipient: recipientId,
  //         content,
  //         timestamp: Date.now(),
  //       });
  //       const savedMessage = await message.save();

  //       // Add saved message ID to relevant chat document
  //       await Chat.findByIdAndUpdate(chatId, {
  //         $push: { messages: savedMessage._id },
  //         //   lastMessage: savedMessage.content,
  //         //   lastMessageAt: savedMessage.timestamp,
  //       });

  //       // Emit message to sender and recipient
  //       io.to(senderId).emit("newMessage", savedMessage);
  //       io.to(recipientId).emit("newMessage", savedMessage);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   });

  //   // Disconnect user
  //   socket.on("disconnect", () => {
  //     console.log(`User disconnected: ${socket.id}`);
  //   });
  // });
}

module.exports = socketConnection;
