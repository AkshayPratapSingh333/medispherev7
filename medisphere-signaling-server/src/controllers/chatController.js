// chatController.js - optional persistence endpoint for chat messages
const logger = require("../utils/logger");

exports.saveMessage = async (req, res) => {
  try {
    const { roomId, message, user } = req.body;
    // TODO: persist to your DB (call Next.js API or DB directly)
    logger.info("Saving chat message", { roomId, user: user?.id });
    // stub response
    res.json({ ok: true, saved: true });
  } catch (err) {
    logger.error("saveMessage error", err);
    res.status(500).json({ ok: false });
  }
};
