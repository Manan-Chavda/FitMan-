const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getMyHeatmap } = require("../controllers/userController");

const router = express.Router();

router.use(authMiddleware);
router.get("/me/heatmap", getMyHeatmap);

module.exports = router;
