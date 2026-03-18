import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import {
  addSessionLog,
  createSession,
  deleteSession,
  deleteSessionLog,
  getExercises,
  getHeatmap,
  getSession,
  getSessions,
  loginUser,
  registerUser,
  updateSession,
  updateSessionLog
} from "./lib/api";

const TOKEN_KEY = "fitman_token";

function AuthScreen({ onLogin, loading }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const request = mode === "register" ? registerUser : loginUser;
      const data = await request(email, password);
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (error) {
      Alert.alert(mode === "register" ? "Registration failed" : "Login failed", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>FitMan</Text>
      <View style={styles.authTabs}>
        <TouchableOpacity
          style={[styles.authTab, mode === "login" ? styles.authTabActive : null]}
          onPress={() => setMode("login")}
        >
          <Text style={[styles.authTabText, mode === "login" ? styles.authTabTextActive : null]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.authTab, mode === "register" ? styles.authTabActive : null]}
          onPress={() => setMode("register")}
        >
          <Text style={[styles.authTabText, mode === "register" ? styles.authTabTextActive : null]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.helperText}>
        {mode === "register" ? "Create your account to access the dashboard." : "Login to continue to your dashboard."}
      </Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        secureTextEntry
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading || submitting}>
        <Text style={styles.buttonText}>
          {submitting ? (mode === "register" ? "Creating..." : "Logging in...") : mode === "register" ? "Create Account" : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function HomeScreen({ onStartWorkout, onViewSessions, onOpenHeatmap, onLogout, loading }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.helperText}>Start a session, inspect history, or check recovery.</Text>
      <TouchableOpacity style={styles.bigButton} onPress={onStartWorkout} disabled={loading}>
        <Text style={styles.bigButtonText}>{loading ? "Preparing..." : "Start Workout"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onViewSessions}>
        <Text style={styles.secondaryButtonText}>View Sessions</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onOpenHeatmap}>
        <Text style={styles.secondaryButtonText}>Muscle Heatmap</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onLogout}>
        <Text style={styles.linkText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function SessionListScreen({ sessions, onOpenSession, onBack }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Session History</Text>
      {sessions.length === 0 ? <Text style={styles.helperText}>No sessions yet.</Text> : null}
      {sessions.map((session) => (
        <TouchableOpacity key={session.id} style={styles.sessionCard} onPress={() => onOpenSession(session.id)}>
          <Text style={styles.sessionId}>{session.name || session.id}</Text>
          <Text style={styles.helperText}>Volume: {session.total_volume}</Text>
          <Text style={styles.helperText}>Intensity: {session.intensity}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.button} onPress={onBack}>
        <Text style={styles.buttonText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
}

function ExerciseSelector({ exercises, selectedExerciseId, onSelect }) {
  return (
    <View style={styles.selectorWrap}>
      {exercises.map((exercise) => {
        const selected = exercise.id === selectedExerciseId;

        return (
          <TouchableOpacity
            key={exercise.id}
            style={[styles.selectorChip, selected ? styles.selectorChipActive : null]}
            onPress={() => onSelect(exercise.id)}
          >
            <Text style={[styles.selectorText, selected ? styles.selectorTextActive : null]}>
              {exercise.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MuscleHeatmapScreen({ heatmap, view, onChangeView, selectedMuscle, onSelectMuscle, onBack }) {
  const visibleGroups = view === "front"
    ? ["shoulders", "chest", "arms", "core", "legs"]
    : ["shoulders", "back", "arms", "core", "legs"];
  const selectedDetails = heatmap?.details?.[selectedMuscle];

  const getHeatColor = (value) => {
    if (value <= 30) {
      return "#fde68a";
    }

    if (value <= 70) {
      return "#fb923c";
    }

    return "#dc2626";
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Muscle Heatmap</Text>
      <View style={styles.authTabs}>
        <TouchableOpacity
          style={[styles.authTab, view === "front" ? styles.authTabActive : null]}
          onPress={() => onChangeView("front")}
        >
          <Text style={[styles.authTabText, view === "front" ? styles.authTabTextActive : null]}>Front</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.authTab, view === "back" ? styles.authTabActive : null]}
          onPress={() => onChangeView("back")}
        >
          <Text style={[styles.authTabText, view === "back" ? styles.authTabTextActive : null]}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heatmapGrid}>
        {visibleGroups.map((group) => {
          const value = heatmap.muscle_groups[group] || 0;
          const selected = selectedMuscle === group;

          return (
            <TouchableOpacity
              key={group}
              style={[
                styles.heatmapBox,
                { backgroundColor: getHeatColor(value) },
                selected ? styles.heatmapBoxSelected : null
              ]}
              onPress={() => onSelectMuscle(group)}
            >
              <Text style={styles.heatmapLabel}>{group}</Text>
              <Text style={styles.heatmapValue}>{value}%</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sessionCard}>
        <Text style={styles.sessionId}>{selectedMuscle}</Text>
        <Text style={styles.helperText}>Fatigue: {selectedDetails?.normalized ?? 0}%</Text>
        <Text style={styles.helperText}>Raw score: {selectedDetails?.fatigue_score ?? 0}</Text>
        <Text style={styles.helperText}>
          Last trained: {selectedDetails?.last_trained_at ? new Date(selectedDetails.last_trained_at).toLocaleString() : "Never"}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onBack}>
        <Text style={styles.buttonText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
}

function WorkoutSessionScreen({
  session,
  exercises,
  onSaveSet,
  onDeleteSet,
  onRepeatSet,
  onSaveSessionName,
  onDeleteSession,
  onBack,
  logging
}) {
  const [exerciseId, setExerciseId] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [editingLogId, setEditingLogId] = useState("");
  const [sessionName, setSessionName] = useState(session.name || "");

  useEffect(() => {
    setSessionName(session.name || "");
  }, [session.name]);

  useEffect(() => {
    if (exercises.length > 0) {
      setExerciseId((current) => {
        if (current && exercises.some((exercise) => exercise.id === current)) {
          return current;
        }

        return exercises[0].id;
      });
    }
  }, [exercises]);

  const resetForm = () => {
    setWeight("");
    setReps("");
    setEditingLogId("");
    if (exercises.length > 0) {
      setExerciseId(exercises[0].id);
    }
  };

  const handleSaveSet = async () => {
    const resolvedExerciseId = exerciseId || exercises[0]?.id || "";

    if (!resolvedExerciseId || !weight || !reps) {
      Alert.alert("Missing fields", "Select an exercise and enter weight and reps.");
      return;
    }

    const success = await onSaveSet({
      logId: editingLogId,
      payload: {
        exercise_id: resolvedExerciseId,
        weight: Number(weight),
        reps: Number(reps)
      }
    });

    if (success) {
      resetForm();
    }
  };

  const handleEditLog = (log) => {
    setExerciseId(log.exercise_id);
    setWeight(String(log.weight));
    setReps(String(log.reps));
    setEditingLogId(log.id);
  };

  const handleDeleteLog = (logId) => {
    Alert.alert("Delete set", "Remove this set from the session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await onDeleteSet(logId);
          if (editingLogId === logId) {
            resetForm();
          }
        }
      }
    ]);
  };

  const confirmDeleteSession = () => {
    Alert.alert("Delete session", "Remove this session and all its sets?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDeleteSession
      }
    ]);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{session.name || "Session"}</Text>
      <Text style={styles.helperText}>Manual logging with backend analytics.</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Volume</Text>
          <Text style={styles.metricValue}>{session.total_volume}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Intensity</Text>
          <Text style={styles.metricValue}>{session.intensity}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Session Details</Text>
      <TextInput
        placeholder="Session name"
        style={styles.input}
        value={sessionName}
        onChangeText={setSessionName}
      />
      <TouchableOpacity style={styles.button} onPress={() => onSaveSessionName(sessionName)} disabled={logging}>
        <Text style={styles.buttonText}>Save Session Name</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteSession} disabled={logging}>
        <Text style={styles.buttonText}>Delete Session</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{editingLogId ? "Edit Set" : "Add Set"}</Text>
      <ExerciseSelector exercises={exercises} selectedExerciseId={exerciseId} onSelect={setExerciseId} />

      <TextInput
        keyboardType="numeric"
        placeholder="Weight"
        style={styles.largeInput}
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        keyboardType="numeric"
        placeholder="Reps"
        style={styles.largeInput}
        value={reps}
        onChangeText={setReps}
      />

      <TouchableOpacity
        style={styles.bigButton}
        onPress={handleSaveSet}
        disabled={logging || exercises.length === 0 || !exerciseId}
      >
        <Text style={styles.bigButtonText}>
          {logging ? (editingLogId ? "Updating..." : "Adding...") : editingLogId ? "Update Set" : "Add Set"}
        </Text>
      </TouchableOpacity>

      {editingLogId ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
          <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.sectionTitle}>Sets</Text>
      {session.logs.length === 0 ? <Text style={styles.helperText}>No sets logged yet.</Text> : null}
      {session.logs.map((log) => (
        <View key={log.id} style={styles.sessionCard}>
          <Text style={styles.sessionId}>
            {log.exercise_name} - {log.weight}kg x {log.reps}
          </Text>
          <Text style={styles.helperText}>Effective reps: {log.effective_reps}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.inlineRepeatButton} onPress={() => onRepeatSet(log)}>
              <Text style={styles.inlineButtonText}>Repeat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inlineButton} onPress={() => handleEditLog(log)}>
              <Text style={styles.inlineButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inlineDangerButton} onPress={() => handleDeleteLog(log.id)}>
              <Text style={styles.inlineDangerButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={onBack}>
        <Text style={styles.buttonText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [screen, setScreen] = useState("auth");
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [heatmapView, setHeatmapView] = useState("front");
  const [selectedMuscle, setSelectedMuscle] = useState("chest");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

      if (storedToken) {
        setToken(storedToken);
        setScreen("home");
      }

      setLoading(false);
    };

    loadToken();
  }, []);

  const handleLogin = (nextToken) => {
    setToken(nextToken);
    setScreen("home");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setSessions([]);
    setSessionDetails(null);
    setExercises([]);
    setHeatmap(null);
    setScreen("auth");
  };

  const loadWorkoutSession = async (sessionId) => {
    const [sessionData, exerciseData] = await Promise.all([
      getSession(token, sessionId),
      getExercises(token)
    ]);
    setSessionDetails(sessionData);
    setExercises(exerciseData);
    setScreen("workout");
  };

  const openWorkoutSession = async (sessionId) => {
    try {
      setLoading(true);
      await loadWorkoutSession(sessionId);
    } catch (error) {
      Alert.alert("Could not load workout", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    try {
      setLoading(true);
      const session = await createSession(token);
      await loadWorkoutSession(session.id);
    } catch (error) {
      Alert.alert("Could not start workout", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSessions = async () => {
    try {
      setLoading(true);
      const data = await getSessions(token);
      setSessions(data);
      setScreen("sessions");
    } catch (error) {
      Alert.alert("Could not load sessions", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHeatmap = async () => {
    try {
      setLoading(true);
      const data = await getHeatmap(token);
      setHeatmap(data);
      setHeatmapView("front");
      setSelectedMuscle("chest");
      setScreen("heatmap");
    } catch (error) {
      Alert.alert("Could not load heatmap", error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveSession = async () => {
    const updatedSession = await getSession(token, sessionDetails.id);
    setSessionDetails(updatedSession);
  };

  const handleSaveSessionName = async (name) => {
    try {
      if (!name.trim()) {
        Alert.alert("Invalid name", "Session name is required.");
        return;
      }

      setLogging(true);
      await updateSession(token, sessionDetails.id, { name });
      await refreshActiveSession();
    } catch (error) {
      Alert.alert("Could not update session", error.message);
    } finally {
      setLogging(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      setLogging(true);
      await deleteSession(token, sessionDetails.id);
      setSessionDetails(null);
      setScreen("home");
    } catch (error) {
      Alert.alert("Could not delete session", error.message);
    } finally {
      setLogging(false);
    }
  };

  const handleSaveSet = async ({ logId, payload }) => {
    try {
      setLogging(true);
      if (logId) {
        await updateSessionLog(token, sessionDetails.id, logId, payload);
      } else {
        await addSessionLog(token, sessionDetails.id, payload);
      }
      await refreshActiveSession();
      return true;
    } catch (error) {
      Alert.alert("Could not save set", error.message);
      return false;
    } finally {
      setLogging(false);
    }
  };

  const handleDeleteSet = async (logId) => {
    try {
      setLogging(true);
      await deleteSessionLog(token, sessionDetails.id, logId);
      await refreshActiveSession();
    } catch (error) {
      Alert.alert("Could not delete set", error.message);
    } finally {
      setLogging(false);
    }
  };

  const handleRepeatSet = async (log) => {
    try {
      setLogging(true);
      await addSessionLog(token, sessionDetails.id, {
        exercise_id: log.exercise_id,
        weight: Number(log.weight),
        reps: Number(log.reps)
      });
      await refreshActiveSession();
    } catch (error) {
      Alert.alert("Could not repeat set", error.message);
    } finally {
      setLogging(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        {loading && screen === "auth" ? <ActivityIndicator size="large" color="#0f766e" /> : null}

        {!token || screen === "auth" ? <AuthScreen onLogin={handleLogin} loading={loading} /> : null}

        {token && screen === "home" ? (
          <HomeScreen
            onStartWorkout={handleStartWorkout}
            onViewSessions={handleViewSessions}
            onOpenHeatmap={handleOpenHeatmap}
            onLogout={handleLogout}
            loading={loading}
          />
        ) : null}

        {token && screen === "sessions" ? (
          <SessionListScreen
            sessions={sessions}
            onOpenSession={openWorkoutSession}
            onBack={() => setScreen("home")}
          />
        ) : null}

        {token && screen === "workout" && sessionDetails ? (
          <WorkoutSessionScreen
            session={sessionDetails}
            exercises={exercises}
            onSaveSet={handleSaveSet}
            onDeleteSet={handleDeleteSet}
            onRepeatSet={handleRepeatSet}
            onSaveSessionName={handleSaveSessionName}
            onDeleteSession={handleDeleteSession}
            onBack={() => setScreen("home")}
            logging={logging}
          />
        ) : null}

        {token && screen === "heatmap" && heatmap ? (
          <MuscleHeatmapScreen
            heatmap={heatmap}
            view={heatmapView}
            onChangeView={setHeatmapView}
            selectedMuscle={selectedMuscle}
            onSelectMuscle={setSelectedMuscle}
            onBack={() => setScreen("home")}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7f5"
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: "#0f172a"
  },
  authTabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  authTab: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  authTabActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e"
  },
  authTabText: {
    color: "#0f172a",
    fontWeight: "600"
  },
  authTabTextActive: {
    color: "#ffffff"
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16
  },
  largeInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 12,
    fontSize: 20
  },
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12
  },
  bigButton: {
    backgroundColor: "#0f766e",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 12
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  },
  bigButtonText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700"
  },
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "600"
  },
  linkButton: {
    marginTop: 18,
    alignItems: "center"
  },
  linkText: {
    color: "#0f766e",
    fontWeight: "600"
  },
  helperText: {
    color: "#475569",
    marginTop: 6
  },
  sessionId: {
    color: "#0f172a",
    fontWeight: "600",
    textTransform: "capitalize"
  },
  sessionCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginTop: 12
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 14
  },
  metricLabel: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 4
  },
  selectorWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  selectorChip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  selectorChipActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e"
  },
  selectorText: {
    color: "#0f172a",
    fontWeight: "600"
  },
  selectorTextActive: {
    color: "#ffffff"
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10
  },
  inlineButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  inlineRepeatButton: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  inlineButtonText: {
    color: "#0f172a",
    fontWeight: "600"
  },
  inlineDangerButton: {
    backgroundColor: "#dc2626",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  inlineDangerButtonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  heatmapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12
  },
  heatmapBox: {
    width: "47%",
    minHeight: 110,
    borderRadius: 16,
    padding: 14,
    justifyContent: "space-between"
  },
  heatmapBoxSelected: {
    borderWidth: 3,
    borderColor: "#0f172a"
  },
  heatmapLabel: {
    textTransform: "capitalize",
    fontWeight: "700",
    color: "#111827",
    fontSize: 18
  },
  heatmapValue: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 22
  }
});
