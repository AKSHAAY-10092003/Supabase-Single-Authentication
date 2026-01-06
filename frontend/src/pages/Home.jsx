import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

export default function Home() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Welcome to Home</h1>
      <p>This is a public page accessible to everyone.</p>
      
      {session ? (
        <div>
          <p>You are logged in as: {session.user.email}</p>
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <Link to="/profile">
              <button>Go to Profile</button>
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <Link to="/auth">
            <button>Sign In / Sign Up</button>
          </Link>
        </div>
      )}
    </div>
  );
}

