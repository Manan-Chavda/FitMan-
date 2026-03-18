import SessionClient from "../../../components/SessionClient";

export default function SessionPage({ params }) {
  return <SessionClient sessionId={params.id} />;
}
