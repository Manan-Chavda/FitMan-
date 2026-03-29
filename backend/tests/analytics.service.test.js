const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calculateVolume,
  calculateEffectiveReps,
  getUserCapacityFactor,
  classifyIntensity
} = require("../src/services/analyticsService");

test("volume tracking multiplies weight and reps", () => {
  assert.equal(calculateVolume({ weight: 80, reps: 10 }), 800);
  assert.equal(calculateVolume({ weight: 82.5, reps: 8 }), 660);
});

test("effective reps only count hard reps", () => {
  assert.equal(calculateEffectiveReps(4), 0);
  assert.equal(calculateEffectiveReps(8), 4);
});

test("session intensity uses full workload instead of raw total volume only", () => {
  assert.equal(
    classifyIntensity([
      { weight: 20, reps: 8, effective_reps: 1, rpe: 6 }
    ]),
    "Low"
  );

  assert.equal(
    classifyIntensity([
      { weight: 60, reps: 8, effective_reps: 4, rpe: 8 },
      { weight: 60, reps: 8, effective_reps: 4, rpe: 8 },
      { weight: 60, reps: 8, effective_reps: 4, rpe: 8 }
    ]),
    "Moderate"
  );

  assert.equal(
    classifyIntensity([
      { weight: 100, reps: 6, effective_reps: 2, rpe: 9 },
      { weight: 100, reps: 6, effective_reps: 2, rpe: 9 },
      { weight: 100, reps: 6, effective_reps: 2, rpe: 9 },
      { weight: 100, reps: 6, effective_reps: 2, rpe: 9 }
    ]),
    "High"
  );

  assert.equal(
    classifyIntensity([
      { weight: 140, reps: 8, effective_reps: 4, rpe: 9.5 },
      { weight: 140, reps: 8, effective_reps: 4, rpe: 9.5 },
      { weight: 140, reps: 8, effective_reps: 4, rpe: 9.5 },
      { weight: 140, reps: 8, effective_reps: 4, rpe: 9.5 }
    ]),
    "Very High"
  );
});

test("higher experience and capacity reduce intensity for the same workload", () => {
  const logs = [
    { weight: 60, reps: 8, effective_reps: 4, rpe: 7.5 },
    { weight: 60, reps: 8, effective_reps: 4, rpe: 7.5 },
    { weight: 60, reps: 8, effective_reps: 4, rpe: 7.5 }
  ];

  assert.equal(
    classifyIntensity(logs, {
      training_years: 0,
      bodyweight_kg: 65,
      fatigue_resistance: "low"
    }),
    "Moderate"
  );

  assert.equal(
    classifyIntensity(logs, {
      training_years: 10,
      bodyweight_kg: 90,
      fatigue_resistance: "elite"
    }),
    "Low"
  );
});

test("capacity factor increases with profile strength", () => {
  assert.ok(
    getUserCapacityFactor({
      training_years: 10,
      bodyweight_kg: 90,
      fatigue_resistance: "elite"
    }) >
      getUserCapacityFactor({
        training_years: 0,
        bodyweight_kg: 65,
        fatigue_resistance: "low"
      })
  );
});
