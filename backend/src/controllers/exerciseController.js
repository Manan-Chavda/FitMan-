const asyncHandler = require("../middleware/asyncHandler");
const { getExercises } = require("../services/exerciseService");

const list = asyncHandler(async (_req, res) => {
  const exercises = await getExercises();
  res.json(exercises);
});

module.exports = {
  list
};
