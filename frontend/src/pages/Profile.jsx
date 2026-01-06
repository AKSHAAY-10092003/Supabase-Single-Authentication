import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Profile() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Profile</h1>
      <p>This page is only accessible to authenticated users.</p>
      
      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#1a1a1a", borderRadius: "8px" }}>
        <h2>User Information</h2>
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>User ID:</strong> {session.user.id}</p>
        <p><strong>Created At:</strong> {new Date(session.user.created_at).toLocaleString()}</p>
        <p><strong>Last Sign In:</strong> {new Date(session.user.last_sign_in_at).toLocaleString()}</p>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <Link to="/">
          <button>Back to Home</button>
        </Link>
        <Link to="/update-password">
          <button>Change Password</button>
        </Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

