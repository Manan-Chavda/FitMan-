"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "../lib/api";

const FRONT_GROUPS = ["shoulders", "chest", "arms", "core", "legs"];
const BACK_GROUPS = ["shoulders", "back", "arms", "core", "legs"];

const getHeatColor = (value) => {
  if (value <= 30) {
    return "#fde68a";
  }

  if (value <= 70) {
    return "#fb923c";
  }

  return "#dc2626";
};

export default function HeatmapClient() {
  const router = useRouter();
  const [view, setView] = useState("front");
  const [selectedMuscle, setSelectedMuscle] = useState("chest");
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("fitman_token");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    loadHeatmap(storedToken);
  }, [router]);

  const loadHeatmap = async (token) => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/users/me/heatmap", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHeatmap(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const visibleGroups = view === "front" ? FRONT_GROUPS : BACK_GROUPS;
  const selectedDetails = useMemo(() => heatmap?.details?.[selectedMuscle], [heatmap, selectedMuscle]);

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Recovery</p>
          <h1 style={styles.title}>Muscle Heatmap</h1>
          <p style={styles.copy}>Tap a muscle group to inspect fatigue and last trained time.</p>
        </div>
        <Link href="/dashboard" style={styles.backLink}>
          Back to Dashboard
        </Link>
      </section>

      <section style={styles.toolbar}>
        <button type="button" style={{ ...styles.toggle, ...(view === "front" ? styles.toggleActive : {}) }} onClick={() => setView("front")}>
          Front
        </button>
        <button type="button" style={{ ...styles.toggle, ...(view === "back" ? styles.toggleActive : {}) }} onClick={() => setView("back")}>
          Back
        </button>
      </section>

      {loading ? <p>Loading heatmap...</p> : null}
      {error ? <p style={styles.error}>{error}</p> : null}

      {heatmap ? (
        <section style={styles.grid}>
          <div style={styles.bodyCard}>
            {visibleGroups.map((group) => {
              const value = heatmap.muscle_groups[group] || 0;

              return (
                <button
                  key={group}
                  type="button"
                  style={{
                    ...styles.muscleBox,
                    background: getHeatColor(value),
                    ...(selectedMuscle === group ? styles.selectedBox : {})
                  }}
                  onClick={() => setSelectedMuscle(group)}
                >
                  <span style={styles.muscleLabel}>{group}</span>
                  <span style={styles.muscleValue}>{value}%</span>
                </button>
              );
            })}
          </div>

          <div style={styles.detailsCard}>
            <h2 style={styles.detailsTitle}>{selectedMuscle}</h2>
            <p style={styles.detailValue}>{selectedDetails?.normalized ?? 0}% fatigue</p>
            <p style={styles.copy}>Raw score: {selectedDetails?.fatigue_score ?? 0}</p>
            <p style={styles.copy}>
              Last trained: {selectedDetails?.last_trained_at ? new Date(selectedDetails.last_trained_at).toLocaleString() : "Never"}
            </p>
          </div>
        </section>
      ) : null}
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
    marginBottom: "24px"
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
    fontSize: "44px"
  },
  copy: {
    color: "#64748b"
  },
  toolbar: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  toggle: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "10px 16px",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 700
  },
  toggleActive: {
    background: "#0f766e",
    borderColor: "#0f766e",
    color: "#ffffff"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px"
  },
  bodyCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "14px"
  },
  detailsCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)"
  },
  muscleBox: {
    border: 0,
    borderRadius: "18px",
    minHeight: "120px",
    padding: "16px",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  selectedBox: {
    outline: "3px solid #0f172a"
  },
  muscleLabel: {
    textTransform: "capitalize",
    fontWeight: 700,
    fontSize: "18px",
    color: "#111827"
  },
  muscleValue: {
    fontWeight: 700,
    fontSize: "22px",
    color: "#111827"
  },
  detailsTitle: {
    textTransform: "capitalize",
    marginTop: 0,
    marginBottom: "8px"
  },
  detailValue: {
    fontSize: "32px",
    fontWeight: 700,
    margin: "0 0 12px"
  },
  backLink: {
    padding: "12px 18px",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    background: "#ffffff"
  },
  error: {
    color: "#b91c1c"
  }
};
