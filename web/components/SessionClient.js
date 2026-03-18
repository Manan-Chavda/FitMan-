"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "../lib/api";

export default function SessionClient({ sessionId }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [session, setSession] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [exerciseId, setExerciseId] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [setFormError, setSetFormError] = useState("");
  const [editingLogId, setEditingLogId] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("fitman_token");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    loadData(storedToken);
  }, [router, sessionId]);

  const loadData = async (authToken) => {
    try {
      setLoading(true);
      setSessionError("");
      setSetFormError("");
      const [sessionData, exerciseData] = await Promise.all([
        apiRequest(`/sessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }),
        apiRequest("/exercises", {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        })
      ]);

      setSession(sessionData);
      setSessionName(sessionData.name || "");
      setExercises(exerciseData);

      if (exerciseData.length > 0) {
        setExerciseId((current) => {
          if (current && exerciseData.some((exercise) => exercise.id === current)) {
            return current;
          }

          return exerciseData[0].id;
        });
      }
    } catch (requestError) {
      setSessionError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSet = async (event) => {
    event.preventDefault();
    const resolvedExerciseId = exerciseId || exercises[0]?.id || "";

    if (!resolvedExerciseId || !weight || !reps) {
      setSetFormError("Exercise, weight, and reps are required.");
      return;
    }

    try {
      setSubmitting(true);
      setSetFormError("");
      const path = editingLogId
        ? `/sessions/${sessionId}/logs/${editingLogId}`
        : `/sessions/${sessionId}/logs`;
      const method = editingLogId ? "PUT" : "POST";

      await apiRequest(path, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          exercise_id: resolvedExerciseId,
          weight: Number(weight),
          reps: Number(reps)
        })
      });

      setWeight("");
      setReps("");
      setEditingLogId("");
      await loadData(token);
    } catch (requestError) {
      setSetFormError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSessionName = async () => {
    if (!sessionName.trim()) {
      setSessionError("Session name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setSessionError("");
      await apiRequest(`/sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: sessionName })
      });
      await loadData(token);
    } catch (requestError) {
      setSessionError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      setSubmitting(true);
      setSessionError("");
      await apiRequest(`/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      router.push("/dashboard");
    } catch (requestError) {
      setSessionError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLog = (log) => {
    setExerciseId(log.exercise_id);
    setWeight(String(log.weight));
    setReps(String(log.reps));
    setEditingLogId(log.id);
    setSetFormError("");
  };

  const handleDeleteLog = async (logId) => {
    try {
      setSubmitting(true);
      setSetFormError("");
      await apiRequest(`/sessions/${sessionId}/logs/${logId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (editingLogId === logId) {
        setEditingLogId("");
        setWeight("");
        setReps("");
      }

      await loadData(token);
    } catch (requestError) {
      setSetFormError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepeatLog = async (log) => {
    try {
      setSubmitting(true);
      setSetFormError("");
      await apiRequest(`/sessions/${sessionId}/logs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          exercise_id: log.exercise_id,
          weight: Number(log.weight),
          reps: Number(log.reps)
        })
      });
      await loadData(token);
    } catch (requestError) {
      setSetFormError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingLogId("");
    setWeight("");
    setReps("");
    setSetFormError("");
  };

  if (loading) {
    return <main style={styles.page}><p>Loading session...</p></main>;
  }

  if (!session) {
    return <main style={styles.page}><p>{sessionError || "Session not found."}</p></main>;
  }

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Workout Session</p>
          <h1 style={styles.title}>{session.name || "Session"}</h1>
          <p style={styles.copy}>Manual logging with backend analytics.</p>
        </div>
        <Link href="/dashboard" style={styles.backLink}>
          Back to Dashboard
        </Link>
      </section>

      <section style={styles.metrics}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Total Volume</p>
          <h2 style={styles.metricValue}>{session.total_volume}</h2>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Intensity</p>
          <h2 style={styles.metricValue}>{session.intensity}</h2>
        </div>
      </section>

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Session Details</h2>
          <input
            value={sessionName}
            onChange={(event) => setSessionName(event.target.value)}
            style={styles.input}
            placeholder="Session name"
          />
          {sessionError ? <p style={styles.error}>{sessionError}</p> : null}
          <button type="button" style={styles.button} onClick={handleSaveSessionName} disabled={submitting}>
            Save Session Name
          </button>
          <button type="button" style={styles.dangerWideButton} onClick={handleDeleteSession} disabled={submitting}>
            Delete Session
          </button>
        </div>

        <form style={styles.card} onSubmit={handleAddSet}>
          <h2 style={styles.cardTitle}>{editingLogId ? "Edit Set" : "Add Set"}</h2>
          <select
            value={exerciseId}
            onChange={(event) => setExerciseId(event.target.value)}
            style={styles.input}
            disabled={exercises.length === 0}
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="Weight"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Reps"
            value={reps}
            onChange={(event) => setReps(event.target.value)}
            style={styles.input}
          />
          {setFormError ? <p style={styles.error}>{setFormError}</p> : null}
          <button type="submit" style={styles.button} disabled={submitting || exercises.length === 0 || !exerciseId}>
            {submitting ? (editingLogId ? "Updating..." : "Adding...") : editingLogId ? "Update Set" : "Add Set"}
          </button>
          {editingLogId ? (
            <button type="button" style={styles.secondaryButton} onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          ) : null}
        </form>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Sets</h2>
          {session.logs.length === 0 ? <p style={styles.copy}>No sets logged yet.</p> : null}
          {session.logs.map((log) => (
            <div key={log.id} style={styles.logCard}>
              <p style={styles.logTitle}>
                {log.exercise_name} - {log.weight}kg x {log.reps}
              </p>
              <p style={styles.copy}>Effective reps: {log.effective_reps}</p>
              <div style={styles.logActions}>
                <button type="button" style={styles.tinyButton} onClick={() => handleRepeatLog(log)}>
                  Repeat
                </button>
                <button type="button" style={styles.smallButton} onClick={() => handleEditLog(log)}>
                  Edit
                </button>
                <button type="button" style={styles.dangerButton} onClick={() => handleDeleteLog(log.id)}>
                  Delete
                </button>
              </div>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    marginBottom: "28px"
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
    fontSize: "44px",
    lineHeight: 1
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  metricCard: {
    background: "#ecfdf5",
    borderRadius: "24px",
    padding: "20px"
  },
  metricLabel: {
    color: "#0f766e",
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: "0.08em"
  },
  metricValue: {
    margin: "8px 0 0",
    fontSize: "40px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)"
  },
  cardTitle: {
    marginTop: 0
  },
  input: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: "16px",
    marginBottom: "12px"
  },
  button: {
    border: 0,
    borderRadius: "14px",
    padding: "16px 18px",
    background: "#0f766e",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%"
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "14px 16px",
    background: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    marginTop: "10px"
  },
  dangerWideButton: {
    border: 0,
    borderRadius: "14px",
    padding: "16px 18px",
    background: "#dc2626",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    marginTop: "10px"
  },
  logCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px",
    marginTop: "12px"
  },
  logTitle: {
    fontWeight: 700,
    margin: 0
  },
  copy: {
    color: "#64748b"
  },
  error: {
    color: "#b91c1c"
  },
  logActions: {
    display: "flex",
    gap: "10px",
    marginTop: "12px"
  },
  smallButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 700
  },
  tinyButton: {
    border: "1px solid #94a3b8",
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#f8fafc",
    cursor: "pointer",
    fontWeight: 700
  },
  dangerButton: {
    border: 0,
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700
  },
  backLink: {
    padding: "12px 18px",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    background: "#ffffff"
  }
};
