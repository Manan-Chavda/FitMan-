const asyncHandler = require("../middleware/asyncHandler");
const {
  createSession,
  getUserSessions,
  getSessionById,
  updateSession,
  deleteSession,
  addExerciseLog,
  updateExerciseLog,
  deleteExerciseLog
} = require("../services/sessionService");

const validateLogPayload = ({ exercise_id, weight, reps }) => {
  if (!exercise_id || weight === undefined || reps === undefined) {
    const error = new Error("exercise_id, weight, and reps are required");
    error.statusCode = 400;
    throw error;
  }

  if (Number(weight) <= 0 || Number(reps) <= 0) {
    const error = new Error("weight and reps must be greater than 0");
    error.statusCode = 400;
    throw error;
  }
};

const create = asyncHandler(async (req, res) => {
  const session = await createSession({
    userId: req.user.id,
    intensity: req.body.intensity
  });

  res.status(201).json(session);
});

const list = asyncHandler(async (req, res) => {
  const sessions = await getUserSessions(req.user.id);
  res.json(sessions);
});

const getById = asyncHandler(async (req, res) => {
  const session = await getSessionById({
    sessionId: req.params.id,
    userId: req.user.id
  });

  res.json({
    id: session.id,
    name: session.name,
    start_time: session.start_time,
    end_time: session.end_time,
    total_volume: session.total_volume,
    intensity: session.intensity,
    logs: session.logs.map((log) => ({
      id: log.id,
      exercise_id: log.exercise_id,
      exercise_name: log.exercise.name,
      weight: log.weight,
      reps: log.reps,
      rpe: log.rpe,
      effective_reps: log.effective_reps,
      created_at: log.created_at
    }))
  });
});

const addLog = asyncHandler(async (req, res) => {
  const { exercise_id, weight, reps, rpe } = req.body;
  validateLogPayload({ exercise_id, weight, reps });

  const result = await addExerciseLog({
    sessionId: req.params.id,
    userId: req.user.id,
    exercise_id,
    weight,
    reps,
    rpe
  });

  res.status(201).json(result);
});

const update = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    const error = new Error("Session name is required");
    error.statusCode = 400;
    throw error;
  }

  const session = await updateSession({
    sessionId: req.params.id,
    userId: req.user.id,
    name
  });

  res.json(session);
});

const remove = asyncHandler(async (req, res) => {
  const result = await deleteSession({
    sessionId: req.params.id,
    userId: req.user.id
  });

  res.json(result);
});

const updateLog = asyncHandler(async (req, res) => {
  const { exercise_id, weight, reps, rpe } = req.body;
  validateLogPayload({ exercise_id, weight, reps });

  const result = await updateExerciseLog({
    sessionId: req.params.id,
    userId: req.user.id,
    logId: req.params.logId,
    exercise_id,
    weight,
    reps,
    rpe
  });

  res.json(result);
});

const removeLog = asyncHandler(async (req, res) => {
  const result = await deleteExerciseLog({
    sessionId: req.params.id,
    userId: req.user.id,
    logId: req.params.logId
  });

  res.json(result);
});

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  addLog,
  updateLog,
  removeLog
};
