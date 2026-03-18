const test = require("node:test");
const assert = require("node:assert/strict");

const {
  applyDecay,
  normalizeHeatmap,
  updateHeatmap,
  getUserHeatmap
} = require("../src/services/heatmapService");

test("adding multiple sets increases fatigue correctly", async () => {
  const updates = [];
  const creates = [];
  const fakePrisma = {
    exercise: {
      findUnique: async () => ({ muscle_groups: ["chest", "arms"] })
    },
    muscleHeatmap: {
      findMany: async () => [],
      create: async ({ data }) => {
        creates.push(data);
        return data;
      },
      update: async ({ data }) => {
        updates.push(data);
        return data;
      }
    }
  };

  await updateHeatmap("user-1", "bench-press", 100, 4, { prismaClient: fakePrisma, now: new Date("2026-03-19T00:00:00.000Z") });
  await updateHeatmap("user-1", "bench-press", 100, 4, {
    prismaClient: {
      ...fakePrisma,
      muscleHeatmap: {
        ...fakePrisma.muscleHeatmap,
        findMany: async () => [
          {
            id: "1",
            muscle_group: "chest",
            fatigue_score: 4,
            last_updated_at: new Date("2026-03-19T00:00:00.000Z")
          },
          {
            id: "2",
            muscle_group: "arms",
            fatigue_score: 4,
            last_updated_at: new Date("2026-03-19T00:00:00.000Z")
          }
        ]
      }
    },
    now: new Date("2026-03-19T00:00:00.000Z")
  });

  assert.equal(creates.length, 2);
  assert.equal(updates.length, 2);
  assert.equal(updates[0].fatigue_score, 8);
  assert.equal(updates[1].fatigue_score, 8);
});

test("decay reduces fatigue over time", () => {
  const decayed = applyDecay(
    {
      fatigue_score: 10,
      last_updated_at: new Date("2026-03-18T00:00:00.000Z")
    },
    new Date("2026-03-19T00:00:00.000Z")
  );

  assert.ok(decayed.fatigue_score < 10);
  assert.ok(decayed.fatigue_score > 8.9);
});

test("normalization works correctly", () => {
  const normalized = normalizeHeatmap([
    { muscle_group: "chest", fatigue_score: 5 },
    { muscle_group: "back", fatigue_score: 10 }
  ]);

  assert.equal(normalized.back, 100);
  assert.equal(normalized.chest, 50);
  assert.equal(normalized.legs, 0);
});

test("edge case no data returns all zeros", async () => {
  const result = await getUserHeatmap("user-1", {
    prismaClient: {
      muscleHeatmap: {
        findMany: async () => [],
        update: async () => null
      }
    },
    now: new Date("2026-03-19T00:00:00.000Z")
  });

  assert.deepEqual(result.muscle_groups, {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
    core: 0
  });
});

test("edge case only one muscle used normalizes to 100", () => {
  const normalized = normalizeHeatmap([{ muscle_group: "core", fatigue_score: 3 }]);
  assert.equal(normalized.core, 100);
  assert.equal(normalized.chest, 0);
});
