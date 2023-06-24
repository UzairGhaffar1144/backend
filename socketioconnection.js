const socketio = require("socket.io");
const admin = require("firebase-admin");
const serviceAccount = require("./notifications-7e719-firebase-adminsdk-iqydz-0eb3cae08a.json");
const { Appointment } = require("./models/appointment");

// const { Appointment } = require("./models/appointment");
const { Psychologist } = require("./models/psychologist");

const { Patient } = require("./models/patient");
const { setInterval } = require("timers");
const Message = require("./models/message");
const Chat = require("./models/chat");
const { UserSocket } = require("./models/socket");
const { forEach } = require("lodash");

// Usage: Call the `sendAppointmentNotifications` function with the `io` parameter from your socket connection setup.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Other Firebase configurations if needed
});

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
  const socketData = {};
  UserSocket.find({}, (err, sockets) => {
    if (err) {
      console.log(err);
    } else {
      users = sockets.map((socket) => ({
        userId: socket.userId,
        socketId: socket.socketId,
        deviceToken: socket.deviceToken,
      }));
      console.log(users);
    }
  });

  // const addUser = (userId, socketId) => {
  //   !users.some((user) => user.userId === userId) &&
  //     users.push({ userId, socketId });
  // };
  const addDeviceToken = (userId, deviceToken) => {
    if (!socketData[userId]) {
      console.log("User not found:", userId);
    } else {
      socketData[userId].deviceToken = deviceToken;
      console.log(socketData);
    }
    // UserSocket.findOne({ userId: userId }, (err, userSocket) => {
    //   if (err) {
    //     console.error("Error finding user socket:", err);
    //     return;
    //   }
    //   if (userSocket) {
    //     // user exist in usersocket
    //     if (userSocket.deviceToken !== deviceToken) {
    //       // Device token is updated
    //       userSocket.deviceToken = deviceToken;
    //       userSocket.save((err) => {
    //         if (err) {
    //           console.error("Error updating user socket:", err);
    //           return;
    //         }
    //       });
    //     } else {
    //       // Device token is the same as previous
    //       console.log("Device token is already up to date.");
    //     }
    //   } else {
    //     // User does not exist in UserSocket model, create new entry
    //     const newUserSocket = new UserSocket({
    //       userId: userId,
    //       deviceToken: deviceToken,
    //     });
    //     newUserSocket.save((err) => {
    //       if (err) {
    //         console.error("Error creating user socket:", err);
    //         return;
    //       }
    //     });
    //   }
    // });
  };

  const addUser = /*async*/ (userId, socketId /*, deviceToken*/) => {
    if (!socketData[userId]) {
      socketData[userId] = { socketId: socketId };
      console.log("User added:", userId);
    } else {
      socketData[userId].socketId = socketId;
    }
    console.log(socketData);
    // let socket = await UserSocket.findOne({ userId });

    // if (socket) {
    //   // update existing socket
    //   socket.socketId = socketId;
    //   // socket.deviceToken = deviceToken;
    //   // await socket.save();
    // } else {
    //   // create new socket
    //   socket = new UserSocket({ userId, socketId /*, deviceToken */ });
    //   // await newSocket.save();
    //   // users.push({ userId, socketId });
    //   // add new user to the users array
    // }
    // await socket.save();
    // const index = users.findIndex((user) => user.userId === userId);
    // if (index !== -1) {
    //   users[index].socketId = socketId;
    // } else {
    //   users.push({ userId, socketId /*, deviceToken*/ });
    // }
    // console.log(users);

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
      const patientIds = appointments.map(
        (appointment) => appointment.patient_id
      );

      const psychologists = await Psychologist.find(
        { _id: { $in: psychologistIds } },
        "user_id"
      );

      const patients = await Patient.find(
        { _id: { $in: patientIds } },
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
          console.log(appointments);
          const appointment = appointments.find((appointment) => {
            return (
              appointment.psychologist_id.toString() ===
              psychologist._id.toString()
            );
          });

          console.log(appointment);
          if (appointment) {
            if (user.deviceToken) {
              console.log("notification to device token");
            } else {
              console.log(" is not send notification to device token");
            }
            io.to(user.socketId).emit("appointmentNotification", {
              appointmentId: appointment._id,
            });
            console.log(
              "Sent tp psychologist notification for appointment:",
              appointment._id
            );
          }
        }
      });
      patients.forEach((patient) => {
        const user = getUser(patient.user_id);
        if (!user) {
          console.log(
            "User socket does not exist. User never connected. User ID:",
            patient.user_id
          );
        } else {
          const appointment = appointments.find((appointment) => {
            return appointment.patient_id.toString() === patient._id.toString();
          });

          if (appointment) {
            if (user.deviceToken) {
              console.log("notification to device token");
            } else {
              console.log(" is not send notification to device token");
            }
            io.to(user.socketId).emit("appointmentNotification", {
              appointmentId: appointment._id,
            });
            console.log(
              "Sent to patietnt notification for appointment:",
              appointment._id
            );
          }
        }
      });
      const message = {
        notification: {
          title: "Appointment notification",
          body: "Your appointment is coming today ",
        },
      };
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
    const user = socketData[userId];
    // const user = users.find((user) => user.userId == userId);
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

    socket.on("addUser", (userId /*, deviceToken*/) => {
      // const index = users.findIndex((obj) => obj.userId === userId);

      // if (index !== -1) {
      //   users[index].socketId = socket.id;
      // } else {
      console.log("user id is " + userId);
      if (userId) {
        addUser(userId, socket.id /*, deviceToken*/);
      }

      // }

      io.emit("getUsers", users);
    });
    socket.on("addDevicetoken", (userId, deviceToken) => {
      console.log("user id is " + userId);
      if (userId) {
        addDeviceToken(userId, deviceToken);
      }
      console.log(userId);
      console.log(deviceToken);
      console.log("add device token function ");
    });

    //send and get message

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    });

    // notification event for backend which will send to socket and save new notification
    socket.on("sendNotification", async ({ user_id, type, message }) => {
      const user = getUser(user_id);
      io.to(user.socketId).emit("getNotification", {
        type,
        message,
      });
      const newNotification = new Notification({
        user_id: user_id,
        type: type,
        message: message,
      });

      await newNotification.save();
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
}

module.exports = socketConnection;
