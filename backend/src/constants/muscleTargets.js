const MUSCLE_GROUP_CONFIG = {
  chest: ["upper_chest", "mid_chest", "lower_chest"],
  back: ["lats", "mid_back", "lower_back"],
  shoulders: ["front_delts", "lateral_delts", "rear_delts"],
  arms: ["biceps", "triceps", "forearms"],
  legs: ["quads", "hamstrings", "glutes", "calves"],
  core: ["upper_abs", "lower_abs", "obliques"]
};

const MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_CONFIG);

const MUSCLE_TARGET_KEYS = new Set(
  MUSCLE_GROUPS.flatMap((group) => MUSCLE_GROUP_CONFIG[group].map((subgroup) => `${group}.${subgroup}`))
);

const formatMuscleLabel = (value) =>
  value
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");

module.exports = {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_CONFIG,
  MUSCLE_TARGET_KEYS,
  formatMuscleLabel
};
