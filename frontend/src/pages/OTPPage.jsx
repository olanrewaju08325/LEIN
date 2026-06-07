import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { resendOTP, verifyOTP } from "../services/auth";

function maskEmail(email) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 3)}***@${domain}`;
}

export default function OTPPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleVerify() {
    setLoading(true);
    setError("");
    try {
      await verifyOTP(email, token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError("");
    setMessage("");
    try {
      const data = await resendOTP(email);
      setMessage(data.message || "New code sent");
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg-panel)",
          border: "1px solid var(--border-bright)",
          borderRadius: "var(--radius-xl)",
          padding: 32,
          boxShadow: "var(--shadow-panel)",
          color: "var(--text-primary)",
          textAlign: "center",
        }}
      >
        <div style={{ width: 68, height: 68, borderRadius: 999, background: "rgba(59,130,246,0.14)", color: "var(--ai-blue)", display: "grid", placeItems: "center", margin: "0 auto 22px", border: "1px solid var(--ai-blue-glow)" }}>
          <Mail size={32} />
        </div>
        <h1 style={{ color: "var(--text-primary)", fontSize: 32, fontWeight: 900, margin: "0 0 10px" }}>Check your email</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, margin: "0 0 28px" }}>
          We sent a 6-digit code to
          <br />
          <span style={{ color: "var(--ai-blue)", fontWeight: 900 }}>{maskEmail(email)}</span>
        </p>

        <input
          type="text"
          maxLength={6}
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          style={{
            width: "100%",
            maxWidth: 240,
            height: 68,
            textAlign: "center",
            letterSpacing: 12,
            color: "var(--text-primary)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-bright)",
            borderRadius: "var(--radius-lg)",
            fontSize: 32,
            fontWeight: 900,
            margin: "0 auto 18px",
            outline: "none",
            paddingLeft: 12,
          }}
        />

        {error && <div style={{ color: "var(--alert-red)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-lg)", padding: 14, fontSize: 14, fontWeight: 800, marginBottom: 16, textAlign: "left" }}>{error}</div>}
        {message && <div style={{ color: "var(--safe-green)", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "var(--radius-lg)", padding: 14, fontSize: 14, fontWeight: 800, marginBottom: 16, textAlign: "left" }}>{message}</div>}

        <button
          style={{ width: "100%", height: 54, background: "var(--ai-blue)", color: "var(--text-primary)", border: "1px solid var(--ai-blue)", borderRadius: "var(--radius-lg)", fontWeight: 900, cursor: loading || token.length !== 6 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 22 }}
          onClick={handleVerify}
          disabled={loading || token.length !== 6}
        >
          {loading ? <Loader2 className="inline-spin" size={18} /> : null}
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          Didn't receive the code?
          <button
            style={{
              display: "block",
              margin: "8px auto 0",
              background: "transparent",
              border: 0,
              color: countdown > 0 ? "var(--text-muted)" : "var(--ai-blue)",
              fontWeight: 900,
              cursor: countdown > 0 || resending ? "not-allowed" : "pointer",
            }}
            onClick={handleResend}
            disabled={countdown > 0 || resending}
          >
            {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </div>

        <button
          onClick={() => navigate("/login")}
          style={{ background: "transparent", border: 0, color: "var(--text-muted)", cursor: "pointer", fontSize: 14, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={16} />
          Back to login
        </button>
      </motion.div>
    </div>
  );
}
