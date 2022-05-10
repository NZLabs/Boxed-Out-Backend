const { DEFAULT_MAX_PLAYERS, DEFAULT_MAX_TIMER } = require("../../config.json");

class Room {
  constructor(options) {
    this.io = options.io;
    this.socker = options.socker;
    this.username = options.username;
    this.roomId = options.roomId;
  }

  async init() {
    const clients = await this.io.in(this.roomId).allSockets();
    if (!clients) {
      console.error("[ERROR] Room creation failed");
    }

    console.log(`Clients: ${clients}`);
  }
}
