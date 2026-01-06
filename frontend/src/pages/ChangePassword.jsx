import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [session, setSession] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we have token_hash in URL (password reset callback)
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (token_hash && type === "recovery") {
      setVerifying(true);
      // Verify the recovery token
      supabase.auth
        .verifyOtp({
          token_hash,
          type: "recovery",
        })
        .then(({ error }) => {
          if (error) {
            setError(error.message);
          } else {
            // Clear URL params
            window.history.replaceState({}, document.title, "/update-password");
          }
          setVerifying(false);
        });
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && !token_hash) {
        // If no session and no token, redirect to reset request
        navigate("/reset-password");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Check if we have a session first
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        setError("Please click the link from your email first");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password updated successfully! Redirecting...");
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
        <h1>Verifying Reset Link</h1>
        <p>Please wait while we verify your password reset link...</p>
      </div>
    );
  }

  if (!session && !searchParams.get("token_hash")) {
    return null; // Will redirect
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Change Password</h1>
      <p>Enter your new password below.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="New password"
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
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Loading..." : "Update Password"}
        </button>
      </form>

      <Link
        to="/"
        style={{ display: "block", textAlign: "center", marginTop: "1rem" }}
      >
        Back to Home
      </Link>
    </div>
  );
}

