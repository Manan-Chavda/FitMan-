const prisma = require("../models/prisma");
const { MUSCLE_GROUPS, MUSCLE_GROUP_SET } = require("../constants/muscleGroups");

const CACHE_TTL_MS = 30 * 1000;
const heatmapCache = new Map();

const clampToZero = (value) => (value < 0 ? 0 : value);

const toDate = (value) => (value instanceof Date ? value : new Date(value));

const getFatigueIncrease = (weight, effectiveReps) => Number(effectiveReps) * (Number(weight) / 100);

const validateMuscleGroups = (groups) => {
  if (!Array.isArray(groups)) {
    const error = new Error("Exercise muscle groups must be an array");
    error.statusCode = 500;
    throw error;
  }

  for (const group of groups) {
    if (!MUSCLE_GROUP_SET.has(group)) {
      const error = new Error(`Invalid muscle group: ${group}`);
      error.statusCode = 500;
      throw error;
    }
  }

  return groups;
};

const applyDecay = (record, now = new Date()) => {
  const currentTime = toDate(now);
  const lastUpdatedAt = toDate(record.last_updated_at);
  const elapsedMs = Math.max(0, currentTime.getTime() - lastUpdatedAt.getTime());
  const daysPassed = elapsedMs / (24 * 60 * 60 * 1000);
  const decayFactor = Math.pow(0.9, daysPassed);
  const fatigueScore = clampToZero(Number(record.fatigue_score) * decayFactor);

  return {
    ...record,
    fatigue_score: fatigueScore,
    last_updated_at: currentTime
  };
};

const normalizeHeatmap = (records) => {
  const maxScore = records.reduce((max, record) => Math.max(max, Number(record.fatigue_score)), 0);
  const normalized = Object.fromEntries(MUSCLE_GROUPS.map((group) => [group, 0]));

  if (maxScore === 0) {
    return normalized;
  }

  for (const record of records) {
    normalized[record.muscle_group] = Number(((Number(record.fatigue_score) / maxScore) * 100).toFixed(2));
  }

  return normalized;
};

const buildHeatmapDetails = (records, normalized) =>
  Object.fromEntries(
    MUSCLE_GROUPS.map((group) => {
      const record = records.find((item) => item.muscle_group === group);

      return [
        group,
        {
          normalized: normalized[group],
          fatigue_score: record ? Number(record.fatigue_score.toFixed(4)) : 0,
          last_trained_at: record ? toDate(record.last_updated_at).toISOString() : null
        }
      ];
    })
  );

const invalidateHeatmapCache = (userId) => {
  heatmapCache.delete(userId);
};

const persistDecayedRecords = async (records, prismaClient) => {
  for (const record of records) {
    await prismaClient.muscleHeatmap.update({
      where: { id: record.id },
      data: {
        fatigue_score: record.fatigue_score,
        last_updated_at: record.last_updated_at
      }
    });
  }
};

const updateHeatmap = async (userId, exerciseId, weight, effectiveReps, options = {}) => {
  const prismaClient = options.prismaClient || prisma;
  const now = toDate(options.now || new Date());

  const exercise = await prismaClient.exercise.findUnique({
    where: { id: exerciseId },
    select: { muscle_groups: true }
  });

  if (!exercise) {
    const error = new Error("Exercise not found for heatmap update");
    error.statusCode = 404;
    throw error;
  }

  const muscleGroups = validateMuscleGroups(exercise.muscle_groups);
  const fatigueIncrease = getFatigueIncrease(weight, effectiveReps);

  if (fatigueIncrease <= 0) {
    invalidateHeatmapCache(userId);
    return { fatigue_increase: 0, updated_groups: [] };
  }

  const existingRecords = await prismaClient.muscleHeatmap.findMany({
    where: {
      user_id: userId,
      muscle_group: { in: muscleGroups }
    }
  });

  const existingByGroup = new Map(existingRecords.map((record) => [record.muscle_group, record]));
  const updatedGroups = [];

  for (const muscleGroup of muscleGroups) {
    const existingRecord = existingByGroup.get(muscleGroup);

    if (existingRecord) {
      const decayedRecord = applyDecay(existingRecord, now);
      const nextScore = clampToZero(decayedRecord.fatigue_score + fatigueIncrease);

      await prismaClient.muscleHeatmap.update({
        where: { id: existingRecord.id },
        data: {
          fatigue_score: nextScore,
          last_updated_at: now
        }
      });

      updatedGroups.push({ muscle_group: muscleGroup, fatigue_score: nextScore });
      continue;
    }

    await prismaClient.muscleHeatmap.create({
      data: {
        user_id: userId,
        muscle_group: muscleGroup,
        fatigue_score: fatigueIncrease,
        last_updated_at: now
      }
    });

    updatedGroups.push({ muscle_group: muscleGroup, fatigue_score: fatigueIncrease });
  }

  invalidateHeatmapCache(userId);
  return {
    fatigue_increase: Number(fatigueIncrease.toFixed(4)),
    updated_groups: updatedGroups
  };
};

const rebuildHeatmap = async (userId, options = {}) => {
  const prismaClient = options.prismaClient || prisma;

  const logs = await prismaClient.exerciseLog.findMany({
    where: {
      session: {
        user_id: userId
      }
    },
    orderBy: { created_at: "asc" },
    include: {
      exercise: {
        select: { muscle_groups: true }
      }
    }
  });

  const muscleState = new Map();

  for (const log of logs) {
    const muscleGroups = validateMuscleGroups(log.exercise.muscle_groups);
    const fatigueIncrease = getFatigueIncrease(log.weight, log.effective_reps);

    if (fatigueIncrease <= 0) {
      continue;
    }

    for (const muscleGroup of muscleGroups) {
      const existing = muscleState.get(muscleGroup);
      const baseRecord = existing || {
        muscle_group: muscleGroup,
        fatigue_score: 0,
        last_updated_at: log.created_at
      };
      const decayed = applyDecay(baseRecord, log.created_at);

      muscleState.set(muscleGroup, {
        muscle_group: muscleGroup,
        fatigue_score: clampToZero(decayed.fatigue_score + fatigueIncrease),
        last_updated_at: toDate(log.created_at)
      });
    }
  }

  await prismaClient.muscleHeatmap.deleteMany({
    where: { user_id: userId }
  });

  const records = [...muscleState.values()];

  if (records.length > 0) {
    await prismaClient.muscleHeatmap.createMany({
      data: records.map((record) => ({
        user_id: userId,
        muscle_group: record.muscle_group,
        fatigue_score: record.fatigue_score,
        last_updated_at: record.last_updated_at
      }))
    });
  }

  invalidateHeatmapCache(userId);
  return records;
};

const getUserHeatmap = async (userId, options = {}) => {
  const prismaClient = options.prismaClient || prisma;
  const now = toDate(options.now || new Date());
  const cached = heatmapCache.get(userId);

  if (cached && cached.expiresAt > now.getTime()) {
    return cached.payload;
  }

  const records = await prismaClient.muscleHeatmap.findMany({
    where: { user_id: userId },
    orderBy: { muscle_group: "asc" }
  });

  const decayedRecords = records.map((record) => applyDecay(record, now));
  await persistDecayedRecords(decayedRecords, prismaClient);

  const muscle_groups = normalizeHeatmap(decayedRecords);
  const payload = {
    muscle_groups,
    details: buildHeatmapDetails(decayedRecords, muscle_groups)
  };

  heatmapCache.set(userId, {
    expiresAt: now.getTime() + CACHE_TTL_MS,
    payload
  });

  return payload;
};

module.exports = {
  MUSCLE_GROUPS,
  updateHeatmap,
  applyDecay,
  normalizeHeatmap,
  rebuildHeatmap,
  getUserHeatmap
};
