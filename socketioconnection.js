const socketio = require("socket.io");
const { Appointment } = require("./models/appointment");

// const { Appointment } = require("./models/appointment");
const Psychologist = require("./models/psychologist").Psychologist;
const { setInterval } = require("timers");
const Message = require("./models/message");
const Chat = require("./models/chat");
const { UserSocket } = require("./models/socket");

// Usage: Call the `sendAppointmentNotifications` function with the `io` parameter from your socket connection setup.

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
    let socket = await UserSocket.findOne({ userId });

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
  const sendAppointmentNotifications = async () => {
    try {
      const currentTime = new Date();
      const nextHour = new Date(currentTime.getTime() + 60 * 60 * 1000);
      console.log(nextHour);
      const appointments = await Appointment.find({
        $and: [
          { "datetime.date": { $eq: nextHour.toISOString().slice(0, 10) } },
          {
            "datetime.time": {
              $gte: currentTime.toISOString().slice(11, 16),
              $lt: nextHour.toISOString().slice(11, 16),
            },
          },
        ],
      });

      const psychologistIds = appointments.map(
        (appointment) => appointment.psychologist_id
      );
      console.log(psychologistIds);
      console.log("hhh");
      console.log(appointments);
      // Fetch the psychologists using the extracted IDs
      const psychologists = await Psychologist.find(
        { _id: { $in: psychologistIds } },
        "user_id"
      );

      console.log(psychologists);

      console.log(appointments);

      psychologists.forEach((psychologist) => {
        const user = getUser(psychologist.user_id);
        console.log("user is" + user);
        if (!user) {
          console.log(
            "user socket does not exist user never connected user ID:",
            psychologist.user_id
          );
        } else {
          console.log("apppppppp");
          console.log(appointments);
          const appointment = appointments.find((appointment) => {
            return (
              appointment.psychologist_id.toString() ===
              psychologist._id.toString()
            );
          });

          console.log(appointment);
          if (appointment) {
            io.to(user.socketId).emit("appointmentNotification", {
              appointmentId: appointment._id,
            });
            console.log("Sent notification for appointment:", appointment._id);
          }
        }
      });
    } catch (err) {
      console.log("Error retrieving appointments:", err);
    }
  };

  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };

  const getUser = (userId) => {
    console.log("this is from getuser");
    console.log("userId:", userId);
    const user = users.find((user) => user.userId == userId);
    console.log(user);
    return user;
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
      console.log("user id is " + userId);
      if (userId) {
        addUser(userId, socket.id);
      }
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
  // setTimeout(() => {
  //   sendAppointmentNotifications();
  // }, 30000);
  setInterval(() => sendAppointmentNotifications(), 20 * 1000);

  // setInterval(() => sendAppointmentNotifications(), 60 * 60 * 1000);

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
