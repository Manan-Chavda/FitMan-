const prisma = require("../models/prisma");

const FATIGUE_RESISTANCE_LEVELS = new Set(["low", "standard", "high", "elite"]);

const normalizeProfilePayload = (payload = {}) => {
  const training_years = Number(payload.training_years);
  const bodyweight_kg = Number(payload.bodyweight_kg);
  const fatigue_resistance = String(payload.fatigue_resistance || "standard").trim().toLowerCase();

  if (Number.isNaN(training_years) || training_years < 0 || training_years > 40) {
    const error = new Error("Training years must be between 0 and 40");
    error.statusCode = 400;
    throw error;
  }

  if (Number.isNaN(bodyweight_kg) || bodyweight_kg < 35 || bodyweight_kg > 300) {
    const error = new Error("Bodyweight must be between 35kg and 300kg");
    error.statusCode = 400;
    throw error;
  }

  if (!FATIGUE_RESISTANCE_LEVELS.has(fatigue_resistance)) {
    const error = new Error("Fatigue resistance must be one of: low, standard, high, elite");
    error.statusCode = 400;
    throw error;
  }

  return {
    training_years,
    bodyweight_kg,
    fatigue_resistance
  };
};

const serializeUserProfile = (user) => ({
  id: user.id,
  email: user.email,
  created_at: user.created_at,
  training_years: user.training_years,
  bodyweight_kg: user.bodyweight_kg,
  fatigue_resistance: user.fatigue_resistance
});

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return serializeUserProfile(user);
};

const updateUserProfile = async (userId, payload) => {
  const data = normalizeProfilePayload(payload);

  const user = await prisma.user.update({
    where: { id: userId },
    data
  });

  return serializeUserProfile(user);
};

module.exports = {
  FATIGUE_RESISTANCE_LEVELS,
  normalizeProfilePayload,
  serializeUserProfile,
  getUserProfile,
  updateUserProfile
};
