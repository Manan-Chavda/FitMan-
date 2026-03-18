const asyncHandler = require("../middleware/asyncHandler");
const { getUserHeatmap } = require("../services/heatmapService");

const getMyHeatmap = asyncHandler(async (req, res) => {
  const heatmap = await getUserHeatmap(req.user.id);
  res.json(heatmap);
});

module.exports = {
  getMyHeatmap
};
