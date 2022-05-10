const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const middleware = require("./src/middleware");
const { create_room, get_room_info } = require("./src/rooms/firestore");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const { db } = require("./src/config/firebase");
const { compileFunction } = require("vm");
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
          data = doc.data();
          data.rid = req.params.id;
          return res.status(200).json({
            type: "success",
            code: "ROOM_FOUND",
            msg: "Room info found",
            data: data,
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
// app.get("/room/join/:id", (req, res) => {
//   if (req.user && req.params.id) {
//     get_room_info(req.params.id, (doc, err) => {
//       console.log(doc);
//       if (err) {
//         return res.status(404).json({
//           type: "error",
//           code: "ROOM_NOT_FOUND",
//           msg: "Room not found",
//         });
//       } else {
//         if (doc.exists) {
//           return res.status(200).json({
//             type: "success",
//             code: "JOINED_TO_ROOM",
//             msg: `Successfully joined to the room(${req.params.id})`,
//             data: doc.data(),
//           });
//         } else {
//           return res.status(404).json({
//             type: "error",
//             code: "ROOM_NOT_FOUND",
//             msg: "Room not found",
//           });
//         }
//       }
//     });
//   } else {
//     return res.status(403).json({
//       type: "error",
//       code: "ROOM_JOIN_PARAM_MISSING",
//       msg: "Room id is required to join a room",
//     });
//   }
// });
try {
  io.on("connection", (socket) => {
    socket.on("JOIN_ROOM_REQUEST", (payload) => {
      socket.join(payload.room.rid);
      socket.nickname = payload.me.name;
      socket.nickid = payload.me.uid;
      socket.is_creator = payload.room.user.uid === payload.me.uid;
      io.in(payload.room.rid)
        .fetchSockets()
        .then((clients) => {
          clients_lst = [];
          for (let client of clients) {
            clients_lst.push({
              socket_id: client.id,
              name: client.nickname,
              is_creator: client.is_creator,
              connected: client.connected,
              uid: client.nickid,
            });
          }
          io.to(payload.room.rid).emit("JOIN_ROOM_RESPONSE", {
            success: true,
            clients: clients_lst,
            msg: null,
          });
        })
        .catch((err) => {
          io.to(payload.room.rid).emit("JOIN_ROOM_RESPONSE", {
            success: false,
            clients: [],
            msg: err.message,
          });
        });
    });

    socket.on("CHALLANGE_SELECT_REQUEST", (payload) => {
      // console.log("Recived the challange request", payload);
      questions = db
        .collection(payload.selected)
        .where("categories", "array-contains", payload.room.type)
        .get()
        .then((snapshot) => {
          question =
            snapshot.docs[
              Math.round(Math.random() * snapshot.docs.length)
            ].data();
          console.log(question);
          io.to(payload.room.rid).emit("CHALLANGE_SELECT_RESPONSE", {
            success: true,
            player: payload.player,
            question: question,
          });
        })
        .catch((err) => {
          io.to(payload.room.rid).emit("CHALLANGE_SELECT_RESPONSE", {
            success: true,
            player: payload.player,
            question: err.message,
          });
        });
    });

    socket.on("CHALLANGE_COMPLETE_REQUEST", (payload) => {
      // console.log("Recived the challange complete request", payload);
      payload.clients[payload.nowPlaying].score +=
        payload.action === "skip" ? -1 : "done" ? 1 : 0;

      io.to(payload.room.rid).emit("CHALLANGE_COMPLETE_RESPONSE", {
        success: true,
        clients: payload.clients,
        player: payload.player,
        action: payload.action,
        nowPlaying:
          payload?.nowPlaying < payload?.clients?.length - 1
            ? payload?.nowPlaying + 1
            : 0,
      });
    });

    // socket.on("VOTING_REQUEST", (payload) => {
    //   console.log("Recived the voting request", payload);
    //   io.to(payload.room.rid).emit("VOTING_RESPONSE", {
    //     success: true,
    //     player: payload.player,
    //     action: "skip",
    //   });
    // });
  });
} catch (err) {
  console.log(err);
}

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
