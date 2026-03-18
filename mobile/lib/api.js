const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const loginUser = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

export const registerUser = (email, password) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

export const createSession = (token) =>
  request("/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({})
  });

export const getSessions = (token) =>
  request("/sessions", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const getExercises = (token) =>
  request("/exercises", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const getSession = (token, sessionId) =>
  request(`/sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const updateSession = (token, sessionId, payload) =>
  request(`/sessions/${sessionId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

export const deleteSession = (token, sessionId) =>
  request(`/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const addSessionLog = (token, sessionId, payload) =>
  request(`/sessions/${sessionId}/logs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

export const updateSessionLog = (token, sessionId, logId, payload) =>
  request(`/sessions/${sessionId}/logs/${logId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

export const deleteSessionLog = (token, sessionId, logId) =>
  request(`/sessions/${sessionId}/logs/${logId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const getHeatmap = (token) =>
  request("/users/me/heatmap", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
