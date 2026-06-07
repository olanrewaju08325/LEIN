import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { login } from "../services/auth";

const inputStyle = {
  width: "100%",
  height: 52,
  color: "var(--text-primary)",
  background: "var(--bg-card)",
  border: "1px solid var(--border-bright)",
  borderRadius: "var(--radius-lg)",
  padding: "0 16px",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 15,
  outline: "none",
};

const labelStyle = {
  display: "block",
  color: "var(--text-secondary)",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 8,
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 820);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 820);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}

function BrandPanel({ isMobile }) {
  if (isMobile) return null;

  const features = ["AI-powered dispatch", "Real-time incident tracking", "Predictive analytics"];

  return (
    <section
      style={{
        flex: 1,
        minHeight: "100vh",
        background: "var(--bg-primary)",
        borderRight: "1px solid var(--border-bright)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        position: "relative",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 18 }}>
          <ShieldAlert size={54} color="var(--premium-gold)" />
          <span style={{ color: "var(--text-primary)", fontSize: 46, fontWeight: 900 }}>LEIN</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 18, fontWeight: 700, margin: "0 0 44px" }}>
          Lagos Emergency Intelligence Network
        </p>
        <div style={{ display: "grid", gap: 16, textAlign: "left" }}>
          {features.map((feature) => (
            <div key={feature} style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontWeight: 800 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: "rgba(16,185,129,0.12)", display: "grid", placeItems: "center", color: "var(--safe-green)" }}>
                <Check size={15} />
              </span>
              {feature}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 32, color: "var(--text-muted)", fontSize: 13, fontWeight: 800 }}>Built for Lagos</div>
    </section>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", fontFamily: "Inter, system-ui, sans-serif" }}>
      <BrandPanel isMobile={isMobile} />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? 24 : 48,
          background: "rgba(255,255,255,0.025)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
              <ShieldAlert size={38} color="var(--premium-gold)" />
              <span style={{ color: "var(--text-primary)", fontSize: 34, fontWeight: 900 }}>LEIN</span>
            </div>
          )}
          <h1 style={{ color: "var(--text-primary)", fontSize: 36, fontWeight: 900, margin: "0 0 8px" }}>Welcome back</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 16, margin: "0 0 32px" }}>Sign in to your dispatcher account</p>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dispatcher@lein.ng" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingRight: 52 }}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 6, top: 6, width: 40, height: 40, padding: 0, background: "transparent", color: "var(--text-muted)", border: 0, cursor: "pointer" }}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: "var(--alert-red)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-lg)", padding: 14, fontSize: 14, fontWeight: 800, marginBottom: 18 }}>
              {error}
            </div>
          )}

          <button
            style={{ width: "100%", height: 52, background: "var(--ai-blue)", color: "var(--text-primary)", border: "1px solid var(--ai-blue)", borderRadius: "var(--radius-lg)", fontWeight: 900, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <Loader2 className="inline-spin" size={18} /> : null}
            {loading ? "Signing in..." : "Login"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "28px 0", color: "var(--border-bright)" }}>
            <div style={{ height: 1, flex: 1, background: "var(--border-bright)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 800 }}>OR</span>
            <div style={{ height: 1, flex: 1, background: "var(--border-bright)" }} />
          </div>

          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--ai-blue)", fontWeight: 900, textDecoration: "none" }}>
              Create account
            </Link>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
