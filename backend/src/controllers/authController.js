const asyncHandler = require("../middleware/asyncHandler");
const { registerUser, loginUser } = require("../services/authService");

const validateAuthPayload = ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }
};

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  validateAuthPayload({ email, password });

  const result = await registerUser({
    email: email.trim().toLowerCase(),
    password
  });

  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  validateAuthPayload({ email, password });

  const result = await loginUser({
    email: email.trim().toLowerCase(),
    password
  });

  res.json(result);
});

module.exports = {
  register,
  login
};
