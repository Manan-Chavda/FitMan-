import AuthForm from "../../components/AuthForm";

export default function LoginPage() {
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.eyebrow}>FitMan</p>
        <h1 style={styles.title}>Login</h1>
        <p style={styles.subtitle}>Use your FitMan account to start and track workouts.</p>
        <AuthForm mode="login" />
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px"
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)"
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
    fontSize: "40px"
  },
  subtitle: {
    color: "#64748b",
    marginBottom: "24px"
  }
};
