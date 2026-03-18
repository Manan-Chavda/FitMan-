const calculateVolume = ({ weight, reps }) => Number(weight) * Number(reps);

const calculateEffectiveReps = (reps) => {
  const numericReps = Number(reps);
  return numericReps >= 5 ? numericReps - 4 : 0;
};

const classifyIntensity = (totalVolume) => {
  const numericVolume = Number(totalVolume);

  if (numericVolume < 1000) {
    return "Low";
  }

  if (numericVolume <= 5000) {
    return "Medium";
  }

  return "High";
};

module.exports = {
  calculateVolume,
  calculateEffectiveReps,
  classifyIntensity
};
