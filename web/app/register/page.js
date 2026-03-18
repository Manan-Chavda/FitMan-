import AuthForm from "../../components/AuthForm";

export default function RegisterPage() {
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.eyebrow}>FitMan</p>
        <h1 style={styles.title}>Register</h1>
        <p style={styles.subtitle}>Create an account to access your workout dashboard.</p>
        <AuthForm mode="register" />
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
