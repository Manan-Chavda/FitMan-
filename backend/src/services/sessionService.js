const prisma = require("../models/prisma");
const {
  calculateVolume,
  calculateEffectiveReps,
  classifyIntensity
} = require("./analyticsService");
const { updateHeatmap, rebuildHeatmap } = require("./heatmapService");

const createSession = async ({ userId, intensity }) => {
  const sessionCount = await prisma.session.count({
    where: { user_id: userId }
  });

  return prisma.session.create({
    data: {
      user_id: userId,
      name: `Session ${sessionCount + 1}`,
      intensity: intensity || "Low"
    }
  });
};

const getOwnedSession = async ({ sessionId, userId, tx = prisma }) => {
  const session = await tx.session.findFirst({
    where: {
      id: sessionId,
      user_id: userId
    }
  });

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    throw error;
  }

  return session;
};

const getUserSessions = async (userId) => {
  return prisma.session.findMany({
    where: { user_id: userId },
    orderBy: { start_time: "desc" },
    include: {
      logs: true
    }
  });
};

const getSessionById = async ({ sessionId, userId }) => {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      user_id: userId
    },
    include: {
      logs: {
        orderBy: { created_at: "asc" },
        include: {
          exercise: true
        }
      }
    }
  });

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    throw error;
  }

  return session;
};

const updateSession = async ({ sessionId, userId, name }) => {
  await getOwnedSession({ sessionId, userId });

  return prisma.session.update({
    where: { id: sessionId },
    data: { name: name.trim() }
  });
};

const deleteSession = async ({ sessionId, userId }) => {
  await getOwnedSession({ sessionId, userId });

  await prisma.session.delete({
    where: { id: sessionId }
  });

  return { message: "Session deleted" };
};

const recalculateSessionAnalytics = async ({ sessionId, tx = prisma }) => {
  const logs = await tx.exerciseLog.findMany({
    where: { session_id: sessionId },
    select: {
      weight: true,
      reps: true
    }
  });

  const totalVolume = logs.reduce((sum, log) => sum + calculateVolume(log), 0);
  const intensity = classifyIntensity(totalVolume);

  await tx.session.update({
    where: { id: sessionId },
    data: {
      total_volume: totalVolume,
      intensity
    }
  });

  return {
    updated_session_volume: totalVolume,
    intensity
  };
};

const addExerciseLog = async ({ sessionId, userId, exercise_id, weight, reps, rpe }) => {
  const now = new Date();
  await getOwnedSession({ sessionId, userId });

  const exercise = await prisma.exercise.findUnique({
    where: { id: exercise_id }
  });

  if (!exercise) {
    const error = new Error("Exercise not found");
    error.statusCode = 404;
    throw error;
  }

  const volume = calculateVolume({ weight, reps });
  const effective_reps = calculateEffectiveReps(reps);

  const result = await prisma.$transaction(async (tx) => {
    await tx.exerciseLog.create({
      data: {
        session_id: sessionId,
        exercise_id,
        weight: Number(weight),
        reps: Number(reps),
        rpe: rpe === undefined || rpe === null || rpe === "" ? null : Number(rpe),
        effective_reps,
        created_at: now
      }
    });

    await updateHeatmap(userId, exercise_id, weight, effective_reps, {
      prismaClient: tx,
      now
    });

    const analytics = await recalculateSessionAnalytics({
      sessionId,
      tx
    });

    return {
      volume,
      effective_reps,
      updated_session_volume: analytics.updated_session_volume,
      intensity: analytics.intensity
    };
  });

  return result;
};

const updateExerciseLog = async ({
  sessionId,
  userId,
  logId,
  exercise_id,
  weight,
  reps,
  rpe
}) => {
  await getOwnedSession({ sessionId, userId });

  const existingLog = await prisma.exerciseLog.findFirst({
    where: {
      id: logId,
      session_id: sessionId
    }
  });

  if (!existingLog) {
    const error = new Error("Log not found");
    error.statusCode = 404;
    throw error;
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: exercise_id }
  });

  if (!exercise) {
    const error = new Error("Exercise not found");
    error.statusCode = 404;
    throw error;
  }

  const volume = calculateVolume({ weight, reps });
  const effective_reps = calculateEffectiveReps(reps);

  return prisma.$transaction(async (tx) => {
    await tx.exerciseLog.update({
      where: { id: logId },
      data: {
        exercise_id,
        weight: Number(weight),
        reps: Number(reps),
        rpe: rpe === undefined || rpe === null || rpe === "" ? null : Number(rpe),
        effective_reps
      }
    });

    await rebuildHeatmap(userId, {
      prismaClient: tx
    });

    const analytics = await recalculateSessionAnalytics({
      sessionId,
      tx
    });

    return {
      volume,
      effective_reps,
      updated_session_volume: analytics.updated_session_volume,
      intensity: analytics.intensity
    };
  });
};

const deleteExerciseLog = async ({ sessionId, userId, logId }) => {
  await getOwnedSession({ sessionId, userId });

  const existingLog = await prisma.exerciseLog.findFirst({
    where: {
      id: logId,
      session_id: sessionId
    }
  });

  if (!existingLog) {
    const error = new Error("Log not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    await tx.exerciseLog.delete({
      where: { id: logId }
    });

    await rebuildHeatmap(userId, {
      prismaClient: tx
    });

    return recalculateSessionAnalytics({
      sessionId,
      tx
    });
  });
};

module.exports = {
  createSession,
  getUserSessions,
  getSessionById,
  updateSession,
  deleteSession,
  addExerciseLog,
  updateExerciseLog,
  deleteExerciseLog
};
