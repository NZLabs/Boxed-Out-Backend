const { db } = require("../config/firebase");

const create_room = (user, room_name, user_name, type, next) => {
  let r_id = room_id();
  r_id = r_id.length === 8 ? r_id : room_id();
  if (r_id.length !== 8)
    return next(
      null,
      new Error(
        "Can't create room with 8 characters long room id. Try again or please contact the administrator."
      )
    );
  db.collection("rooms")
    .doc(r_id)
    .set({
      creator: {
        uid: user.uid,
        name: user_name ? user_name : "Anonymous",
        email: user.email,
      },
      name: room_name,
      type: type,
      timestamp: Date.now(),
    })
    .then((res) => next({ room_id: r_id }, null))
    .catch((error) => next(null, error));
};

const get_room_info = (room_id, next) => {
  db.collection("rooms")
    .doc(room_id)
    .get()
    .then((doc) => next(doc, null))
    .catch((error) => next(null, error));
};

const update_room_type = (room_id, type) => {};

const deleteRoom = (room_id) => {};

const room_id = () => {
  res = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  ts = Date.now();
  ts_str = ts.toString();

  for (let i = 0; i <= 3; i++) {
    res += chars.charAt(Math.round(Math.random() * chars.length));
  }
  return res + ts_str.substring(ts_str.length - 4, ts_str.length);
};

module.exports = { create_room, get_room_info, update_room_type, deleteRoom };
