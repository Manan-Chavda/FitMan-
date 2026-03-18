const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { list } = require("../controllers/exerciseController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", list);

module.exports = router;
