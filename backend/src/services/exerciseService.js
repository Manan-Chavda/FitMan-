const prisma = require("../models/prisma");

const getExercises = async () => {
  return prisma.exercise.findMany({
    orderBy: { name: "asc" }
  });
};

module.exports = {
  getExercises
};
