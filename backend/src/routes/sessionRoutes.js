const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  create,
  list,
  getById,
  update,
  remove,
  addLog,
  updateLog,
  removeLog
} = require("../controllers/sessionController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", create);
router.get("/", list);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/:id/logs", addLog);
router.put("/:id/logs/:logId", updateLog);
router.delete("/:id/logs/:logId", removeLog);

module.exports = router;
