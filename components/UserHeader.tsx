import { signOut, useSession } from "next-auth/react";

export default function UserHeader({ title }: { title: string }) {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <div
      style={{
        backgroundColor: "#242a78",
        color: "#fff",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "Tahoma",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{title}</h1>
      <div style={{ fontSize: "0.9rem" }}>
        Welcome, {user.name || user.email}
        {user.isAdmin && " (Admin)"} |{" "}
        <button
          onClick={() => signOut()}
          style={{
            background: "none",
            border: "none",
            color: "#2d97d5",
            cursor: "pointer",
            fontWeight: "bold",
            marginLeft: "0.5rem",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
