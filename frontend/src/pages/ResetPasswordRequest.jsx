import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for the password reset link!");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Reset Password</h1>
      <p>Enter your email address and we'll send you a link to reset your password.</p>

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
          {loading ? "Loading..." : "Send Reset Link"}
        </button>
      </form>

      <Link
        to="/auth"
        style={{ display: "block", textAlign: "center", marginTop: "1rem" }}
      >
        Back to Sign In
      </Link>
      <Link
        to="/"
        style={{ display: "block", textAlign: "center", marginTop: "0.5rem" }}
      >
        Back to Home
      </Link>
    </div>
  );
}

