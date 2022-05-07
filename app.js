const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const middleware = require("./src/middleware");
const { create_room, get_room_info } = require("./src/rooms");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(middleware.decodeToken);

app.get("/", (req, res) => {
  res.send("Boxed Out Backend");
});

// Get room info
app.get("/room/:id", (req, res) => {
  if (req.user && req.params.id) {
    get_room_info(req.params.id, (doc, err) => {
      if (err) {
        return res.status(404).json({
          type: "error",
          code: "ROOM_NOT_FOUND",
          msg: "Room not found",
        });
      } else {
        if (doc.exists) {
          return res.status(200).json({
            type: "success",
            code: "ROOM_FOUND",
            msg: "Room info found",
            data: doc.data(),
          });
        } else {
          return res.status(404).json({
            type: "error",
            code: "ROOM_NOT_FOUND",
            msg: "Room not found",
          });
        }
      }
    });
  } else {
    return res.status(403).json({
      type: "error",
      code: "ROOM_MISSING_PARAMS",
      msg: "Room id or user missing",
    });
  }
});

// Create Room
app.post("/room/create", (req, res) => {
  if (req.user && req.body.type) {
    create_room(
      req.user,
      "Unnamed Room",
      req.body.displayName,
      req.body.type,
      (result, err) => {
        if (err) {
          return res.status(403).json({
            type: "error",
            code: "ROOM_CREATE_ERROR",
            msg: err.message,
          });
        } else {
          return res.status(200).json({
            type: "success",
            code: "ROOM_CREATE_SUCCESS",
            msg: "Room created successfully",
            data: result,
          });
        }
      }
    );
  } else {
    return res.status(403).json({
      type: "error",
      code: "ROOM_CREATE_PARAM_MISSING",
      msg: "Room type is required to create a room",
    });
  }
});

// Update Room
// app.post("/room/update/:id", (req, res) => {
//   if (req.user && req.params.id && req.body.type) {
//   } else {
//     res.status(403).json({
//       type: "error",
//       code: "ROOM_UPDATE_PARAM_MISSING",
//       msg: "New room type and room id are required to update a room",
//     });
//   }
// });

// Join Room
app.get("/room/join/:id", (req, res) => {
  if (req.user && req.params.id) {
    get_room_info(req.params.id, (doc, err) => {
      console.log(doc);
      if (err) {
        return res.status(404).json({
          type: "error",
          code: "ROOM_NOT_FOUND",
          msg: "Room not found",
        });
      } else {
        if (doc.exists) {
          io.on("connection", (socket) => {
            socket.join(req.params.id);
            console.log("Joined room");
            return res.status(200).json({
              type: "success",
              code: "JOINED_TO_ROOM",
              msg: `Successfully joined to the room(${req.params.id})`,
              data: doc.data(),
            });
          });
          return res.status(400).json({
            type: "error",
            code: "JOINED_TO_ROOM_FAILED",
            msg: `Socket connection error connecting to room(${req.params.id})`,
            data: doc.data(),
          });
        } else {
          return res.status(404).json({
            type: "error",
            code: "ROOM_NOT_FOUND",
            msg: "Room not found",
          });
        }
      }
    });
  } else {
    return res.status(403).json({
      type: "error",
      code: "ROOM_JOIN_PARAM_MISSING",
      msg: "Room id is required to join a room",
    });
  }
});

io.on("connection", (socket) => {
  socket.on("chat_message", (payload, callback) => {
    console.log("Recived the message", payload);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
