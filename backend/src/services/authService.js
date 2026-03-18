const bcrypt = require("bcryptjs");
const prisma = require("../models/prisma");
const { generateToken } = require("./tokenService");

const registerUser = async ({ email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password_hash },
    select: { id: true, email: true, created_at: true }
  });

  const token = generateToken(user.id);

  return { user, token };
};

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }
  };
};

module.exports = {
  registerUser,
  loginUser
};
