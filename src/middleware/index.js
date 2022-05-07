const { admin } = require("../config/firebase");

class Middleware {
  async decodeToken(req, res, next) {
    try {
      let token = "";
      if (req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
        const decordedToken = await admin.auth().verifyIdToken(token);
        req.user = decordedToken;
        if (decordedToken) return next();
        return res.status(403).json({
          type: "error",
          code: "AUTH_TOKEN_INVALID",
          msg: "Provided authorization token is invalid",
        });
      } else
        return res.status(403).json({
          type: "error",
          code: "AUTH_HEADER_NOT_FOUND",
          msg: "Authorization headers not found",
        });
    } catch (e) {
      return res.status(403).json({
        type: "error",
        code: "AUTH_ERROR",
        msg: e.message,
      });
    }
  }
}

module.exports = new Middleware();
