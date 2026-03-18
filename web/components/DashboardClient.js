"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "../lib/api";

export default function DashboardClient() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [latestSessionId, setLatestSessionId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("fitman_token");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    fetchSessions(storedToken);
  }, [router]);

  const fetchSessions = async (authToken) => {
    try {
      setLoading(true);
      const data = await apiRequest("/sessions", {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setSessions(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    try {
      setError("");
      const session = await apiRequest("/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      setLatestSessionId(session.id);
      await fetchSessions(token);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fitman_token");
    router.replace("/login");
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>Dashboard</p>
          <h1 style={styles.title}>Start a workout and review sessions.</h1>
        </div>
        <button style={styles.linkButton} onClick={handleLogout}>
          Logout
        </button>
      </section>

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Start Workout</h2>
          <p style={styles.copy}>Create a new training session for the logged-in user.</p>
          <button style={styles.primaryButton} onClick={handleStartWorkout}>
            Start Workout
          </button>
          {latestSessionId ? (
            <p style={styles.sessionId}>
              Latest session: <Link href={`/session/${latestSessionId}`}>{sessions.find((item) => item.id === latestSessionId)?.name || latestSessionId}</Link>
            </p>
          ) : null}
          {error ? <p style={styles.error}>{error}</p> : null}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Recovery</h2>
          <p style={styles.copy}>Open the muscle heatmap with fatigue decay applied by the backend.</p>
          <Link href="/heatmap" style={styles.primaryLink}>
            Open Heatmap
          </Link>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Sessions</h2>
          {loading ? <p style={styles.copy}>Loading sessions...</p> : null}
          {!loading && sessions.length === 0 ? <p style={styles.copy}>No sessions yet.</p> : null}
          {!loading &&
            sessions.map((session) => (
              <div key={session.id} style={styles.sessionCard}>
                <p style={styles.sessionId}>
                  <Link href={`/session/${session.id}`}>{session.name || session.id}</Link>
                </p>
                <p style={styles.copy}>Volume: {session.total_volume}</p>
                <p style={styles.copy}>Intensity: {session.intensity}</p>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 24px 80px",
    maxWidth: "1100px",
    margin: "0 auto"
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    marginBottom: "32px"
  },
  eyebrow: {
    color: "#0f766e",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginBottom: "8px"
  },
  title: {
    margin: 0,
    fontSize: "48px",
    lineHeight: 1
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)"
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "8px"
  },
  copy: {
    color: "#64748b"
  },
  primaryButton: {
    border: 0,
    borderRadius: "12px",
    padding: "14px 16px",
    background: "#0f766e",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer"
  },
  primaryLink: {
    display: "inline-block",
    borderRadius: "12px",
    padding: "14px 16px",
    background: "#0f766e",
    color: "#ffffff",
    fontWeight: 700
  },
  linkButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "12px 18px",
    background: "#ffffff",
    cursor: "pointer"
  },
  sessionCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px",
    marginTop: "12px"
  },
  sessionId: {
    fontWeight: 700,
    overflowWrap: "anywhere"
  },
  error: {
    color: "#b91c1c"
  }
};
