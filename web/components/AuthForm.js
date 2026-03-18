"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../lib/api";

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const path = isRegister ? "/auth/register" : "/auth/login";
      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem("fitman_token", data.token);
      router.push("/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={styles.tabs}>
        <Link href="/login" style={{ ...styles.tab, ...(isRegister ? {} : styles.tabActive) }}>
          Login
        </Link>
        <Link href="/register" style={{ ...styles.tab, ...(isRegister ? styles.tabActive : {}) }}>
          Register
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={styles.input}
          required
        />
        {error ? <p style={styles.error}>{error}</p> : null}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? (isRegister ? "Creating account..." : "Logging in...") : isRegister ? "Create Account" : "Login"}
        </button>
      </form>
    </>
  );
}

const styles = {
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "16px"
  },
  tab: {
    textAlign: "center",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "12px 14px"
  },
  tabActive: {
    background: "#0f766e",
    color: "#ffffff",
    borderColor: "#0f766e"
  },
  form: {
    display: "grid",
    gap: "12px"
  },
  input: {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "14px 16px",
    fontSize: "16px"
  },
  button: {
    border: 0,
    borderRadius: "12px",
    padding: "14px 16px",
    background: "#0f766e",
    color: "white",
    fontWeight: 700,
    cursor: "pointer"
  },
  error: {
    color: "#b91c1c",
    margin: 0
  }
};
