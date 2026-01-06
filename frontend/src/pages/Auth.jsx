import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/profile");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/profile");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign up with email and password
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (error) {
          setError(error.message);
        } else {
          setMessage("Check your email for the confirmation link!");
        }
      } else {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          setError(error.message);
        } else {
          navigate("/profile");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  };

  if (session) {
    return (
      <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
        <h1>You are already logged in</h1>
        <p>Email: {session.user.email}</p>
        <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
          Logout
        </button>
        <Link to="/profile" style={{ display: "block", marginTop: "1rem" }}>
          <button>Go to Profile</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>{isSignUp ? "Sign Up" : "Sign In"}</h1>
      
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setError(null);
            setMessage(null);
          }}
          style={{
            backgroundColor: !isSignUp ? "#646cff" : "transparent",
            color: !isSignUp ? "white" : "inherit",
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setError(null);
            setMessage(null);
          }}
          style={{
            backgroundColor: isSignUp ? "#646cff" : "transparent",
            color: isSignUp ? "white" : "inherit",
          }}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6em",
              fontSize: "1em",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6em",
              fontSize: "1em",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}
        {message && (
          <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.6em",
            fontSize: "1em",
            marginBottom: "1rem",
          }}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      {!isSignUp && (
        <Link to="/reset-password" style={{ display: "block", textAlign: "center" }}>
          Forgot password?
        </Link>
      )}

      <Link
        to="/"
        style={{ display: "block", textAlign: "center", marginTop: "1rem" }}
      >
        Back to Home
      </Link>
    </div>
  );
}

