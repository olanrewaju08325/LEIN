import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AtSign,
  Brain,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Map,
  Phone,
  Quote,
  Shield,
  ShieldAlert,
  User,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { register } from "../services/auth";

const inputBase = {
  width: "100%",
  height: 54,
  color: "var(--text-primary)",
  background: "var(--bg-card)",
  border: "1px solid var(--border-bright)",
  borderRadius: "var(--radius-lg)",
  padding: "0 46px",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 15,
  outline: "none",
  transition: "all 0.2s ease",
};

const labelStyle = {
  display: "block",
  color: "var(--text-secondary)",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 8,
};

const sectionLabel = {
  color: "var(--text-muted)",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  margin: "0 0 16px",
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 900);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}

function FieldError({ children }) {
  if (!children) return null;
  return <div style={{ color: "var(--alert-red)", fontSize: 12, fontWeight: 800, marginTop: 7 }}>{children}</div>;
}

function InputShell({ label, icon: Icon, error, success, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <Icon size={18} style={{ position: "absolute", left: 16, top: 18, color: "var(--text-muted)" }} />
        {children}
        {success && (
          <Check size={18} style={{ position: "absolute", right: 16, top: 18, color: "var(--safe-green)" }} />
        )}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}

function CustomCheckbox({ checked, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: "transparent",
        border: 0,
        color: "var(--text-secondary)",
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
        fontSize: 14,
        lineHeight: 1.6,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          border: checked ? "1px solid var(--ai-blue)" : "1px solid var(--border-bright)",
          background: checked ? "var(--ai-blue)" : "transparent",
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
          marginTop: 1,
        }}
      >
        {checked && <Check size={14} color="var(--text-primary)" />}
      </span>
      <span>{children}</span>
    </button>
  );
}

function BenefitRow({ icon: Icon, color, title, subtitle }) {
  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          background: color,
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
        }}
      >
        <Icon size={18} color="var(--text-primary)" />
      </div>
      <div>
        <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 900, marginBottom: 3 }}>{title}</div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.45 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function passwordStrength(password) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("dispatcher");
  const [organisation, setOrganisation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedAuthority, setConfirmedAuthority] = useState(false);
  const [wantsUpdates, setWantsUpdates] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const strength = passwordStrength(password);
  const strengthMeta = [
    { label: "Weak", color: "var(--alert-red)" },
    { label: "Weak", color: "var(--alert-red)" },
    { label: "Fair", color: "var(--warn-amber)" },
    { label: "Good", color: "var(--ai-blue)" },
    { label: "Strong", color: "var(--safe-green)" },
  ][strength];

  const usernameValid = /^[A-Za-z0-9_]{3,}$/.test(username);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const confirmValid = Boolean(confirmPassword) && confirmPassword === password;

  function validateFields() {
    const nextErrors = {};
    if (fullName.trim().length < 2) nextErrors.fullName = "Please enter your full name";
    if (!usernameValid) nextErrors.username = "Username can only contain letters, numbers, and underscores";
    if (!emailValid) nextErrors.email = "Please enter a valid email address";
    if (address.trim().length < 3) nextErrors.address = "Please enter your address";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (!confirmValid) nextErrors.confirmPassword = "Passwords do not match";
    if (!acceptedTerms) nextErrors.acceptedTerms = "You must agree to the Terms of Service and Privacy Policy";
    if (!confirmedAuthority) nextErrors.confirmedAuthority = "Please confirm your emergency response authorization";
    return nextErrors;
  }

  async function handleRegister() {
    const validationErrors = validateFields();
    setFieldErrors(validationErrors);
    setError("");
    setMessage("");

    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix the highlighted fields before creating your account.");
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await register(email, password, fullName, {
        username,
        phone_number: phone,
        address,
        role,
        organisation,
        terms_accepted: acceptedTerms,
        authority_confirmed: confirmedAuthority,
        updates_opt_in: wantsUpdates,
      });
      sessionStorage.setItem("username", username);
      sessionStorage.setItem(
        "registration_profile",
        JSON.stringify({
          username,
          phone_number: phone,
          address,
          role,
          organisation,
          terms_accepted: acceptedTerms,
          authority_confirmed: confirmedAuthority,
          updates_opt_in: wantsUpdates,
        })
      );
      setMessage(data.message || "Verification code sent.");
      setTimeout(() => navigate("/verify-otp", { state: { email } }), 1500);
    } catch (err) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 450);
    } finally {
      setLoading(false);
    }
  }

  const roles = [
    ["dispatcher", Shield, "Dispatcher", "Manage incidents and assign responders"],
    ["supervisor", User, "Supervisor", "Oversee dispatch operations"],
    ["observer", Eye, "Observer", "Monitor-only access to dashboard"],
  ];

  const requirements = [
    ["At least 8 characters", password.length >= 8],
    ["One uppercase letter", /[A-Z]/.test(password)],
    ["One number", /\d/.test(password)],
    ["One special character", /[^A-Za-z0-9]/.test(password)],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", fontFamily: "Inter, system-ui, sans-serif" }}>
      {!isMobile && (
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: "50%",
            minHeight: "100vh",
            position: "sticky",
            top: 0,
            background: "radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.12) 0%, transparent 70%), var(--bg-primary)",
            padding: 48,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldAlert size={28} color="var(--premium-gold)" />
            <span style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 900 }}>LEIN</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 520, margin: "0 auto", width: "100%" }}>
            <ShieldAlert size={64} color="var(--premium-gold)" style={{ marginBottom: 24 }} />
            <h1 style={{ color: "var(--text-primary)", fontSize: 48, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", margin: "0 0 12px" }}>Join LEIN</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 16, margin: 0 }}>Lagos Emergency Intelligence Network</p>

            <div style={{ height: 1, background: "var(--border-bright)", margin: "32px 0" }} />

            <h2 style={{ color: "var(--text-primary)", fontSize: 17, fontWeight: 900, margin: "0 0 20px" }}>Why join LEIN?</h2>
            <div style={{ display: "grid", gap: 18 }}>
              <BenefitRow icon={Shield} color="var(--safe-green)" title="Secure & Verified Access" subtitle="OTP email verification for every account" />
              <BenefitRow icon={Zap} color="var(--ai-blue)" title="Real-Time Dispatch Control" subtitle="Manage emergencies as they happen across Lagos" />
              <BenefitRow icon={Brain} color="var(--ai-blue)" title="AI-Powered Intelligence" subtitle="Four AI systems working together for you" />
              <BenefitRow icon={Map} color="var(--warn-amber)" title="Full Lagos Coverage" subtitle="30 hospitals, 10 responder units across 5 LGAs" />
              <BenefitRow icon={Users} color="var(--safe-green)" title="Dispatcher Community" subtitle="Join Lagos emergency response professionals" />
            </div>
          </div>

          <div style={{ ...cardFrame(), padding: 20, maxWidth: 520, margin: "0 auto", width: "100%" }}>
            <Quote size={22} color="var(--premium-gold)" style={{ marginBottom: 12 }} />
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65, margin: "0 0 16px" }}>
              "LEIN changed how we coordinate emergencies in Ikeja. Response time dropped from 20 minutes to under 5."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 999, background: "var(--ai-blue)", color: "var(--text-primary)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 900 }}>
                IK
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 800 }}>— Dispatcher, Ikeja LGA Command</div>
            </div>
          </div>
        </motion.aside>
      )}

      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={shake ? { opacity: 1, x: [0, -8, 8, -8, 8, 0] } : { opacity: 1, x: 0 }}
        transition={shake ? { duration: 0.4 } : { duration: 0.5 }}
        style={{
          width: isMobile ? "100%" : "50%",
          minHeight: "100vh",
          overflowY: "auto",
          background: "rgba(255,255,255,0.02)",
          padding: isMobile ? 24 : 48,
        }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: isMobile ? "center" : "flex-end", alignItems: "center", gap: 6, marginBottom: 42, color: "var(--text-muted)", fontSize: 14 }}>
            <span>Already have an account?</span>
            <button onClick={() => navigate("/login")} style={linkButtonStyle}>
              Sign in
            </button>
          </div>

          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
              <ShieldAlert size={34} color="var(--premium-gold)" />
              <span style={{ color: "var(--text-primary)", fontSize: 30, fontWeight: 900 }}>LEIN</span>
            </div>
          )}

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ color: "var(--text-primary)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Create your account</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 15, margin: 0 }}>Get started with LEIN dispatch access</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: 10, marginBottom: 36 }}>
            {["Personal Info", "Security", "Verification"].map((step, index) => (
              <StepIndicator key={step} label={step} active={index === 0} showLine={index < 2} />
            ))}
          </div>

          <div style={{ display: "grid", gap: 34 }}>
            <section>
              <h2 style={sectionLabel}>Personal Information</h2>
              <div style={{ display: "grid", gap: 18 }}>
                <InputShell label="Full Name *" icon={User} error={fieldErrors.fullName}>
                  <input
                    style={{ ...inputBase, borderColor: fieldErrors.fullName ? "rgba(239,68,68,0.5)" : "var(--border-bright)" }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Adewale Johnson"
                  />
                </InputShell>

                <InputShell label="Username *" icon={AtSign} error={fieldErrors.username} success={usernameValid}>
                  <span style={{ position: "absolute", left: 43, top: 17, color: "var(--text-muted)", fontWeight: 900 }}>@</span>
                  <input
                    style={{ ...inputBase, paddingLeft: 62, paddingRight: 48, borderColor: fieldErrors.username ? "rgba(239,68,68,0.5)" : "var(--border-bright)" }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. dispatcher_ikeja"
                  />
                </InputShell>

                <InputShell label="Email Address *" icon={Mail} error={fieldErrors.email} success={emailValid}>
                  <input
                    style={{ ...inputBase, paddingRight: 48, borderColor: fieldErrors.email ? "rgba(239,68,68,0.5)" : "var(--border-bright)" }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </InputShell>

                <InputShell label="Phone Number (Optional)" icon={Phone}>
                  <input style={inputBase} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 801 234 5678" />
                </InputShell>

                <InputShell label="Address *" icon={Map} error={fieldErrors.address}>
                  <input
                    style={{ ...inputBase, borderColor: fieldErrors.address ? "rgba(239,68,68,0.5)" : "var(--border-bright)" }}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 14 Allen Avenue, Ikeja, Lagos"
                  />
                </InputShell>
              </div>
            </section>

            <section>
              <h2 style={sectionLabel}>Your Role</h2>
              <label style={labelStyle}>I am a *</label>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
                {roles.map(([value, Icon, title, subtitle]) => {
                  const selected = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      style={{
                        ...cardFrame(),
                        background: selected ? "rgba(59,130,246,0.1)" : "var(--bg-panel)",
                        borderColor: selected ? "var(--ai-blue)" : "var(--border-bright)",
                        padding: 16,
                        textAlign: "left",
                        cursor: "pointer",
                        minHeight: 150,
                      }}
                    >
                      <Icon size={22} color={selected ? "var(--ai-blue)" : "var(--text-muted)"} style={{ marginBottom: 14 }} />
                      <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 900, marginBottom: 6 }}>{title}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5 }}>{subtitle}</div>
                    </button>
                  );
                })}
              </div>

              <InputShell label="Organisation (Optional)" icon={Building2}>
                <input
                  style={inputBase}
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="e.g. Lagos State Emergency Management Agency"
                />
              </InputShell>
            </section>

            <section>
              <h2 style={sectionLabel}>Security</h2>
              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <InputShell label="Password *" icon={Lock} error={fieldErrors.password}>
                    <input
                      style={{ ...inputBase, paddingRight: 52, borderColor: fieldErrors.password ? "rgba(239,68,68,0.5)" : "var(--border-bright)" }}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                    />
                    <PasswordToggle visible={showPassword} onClick={() => setShowPassword((v) => !v)} />
                  </InputShell>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7, marginBottom: 8 }}>
                      {[1, 2, 3, 4].map((segment) => (
                        <div
                          key={segment}
                          style={{
                            height: 7,
                            borderRadius: 999,
                            background: segment <= strength ? strengthMeta.color : "var(--border-bright)",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ color: strengthMeta.color, fontSize: 12, fontWeight: 900, marginBottom: 12 }}>{strengthMeta.label}</div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
                      {requirements.map(([text, met]) => (
                        <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-muted)", fontSize: 12, fontWeight: 800 }}>
                          <span style={{ color: met ? "var(--safe-green)" : "var(--alert-red)" }}>{met ? "✓" : "✗"}</span>
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <InputShell label="Confirm Password *" icon={Lock} error={fieldErrors.confirmPassword} success={confirmValid}>
                  <input
                    style={{ ...inputBase, paddingRight: 52, borderColor: fieldErrors.confirmPassword ? "rgba(239,68,68,0.5)" : "var(--border-bright)" }}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                  />
                  <PasswordToggle visible={showConfirmPassword} onClick={() => setShowConfirmPassword((v) => !v)} />
                </InputShell>
              </div>
            </section>

            <section>
              <h2 style={sectionLabel}>Agreements</h2>
              <div style={{ display: "grid", gap: 14 }}>
                <CustomCheckbox checked={acceptedTerms} onClick={() => setAcceptedTerms((v) => !v)}>
                  I agree to the{" "}
                  <span onClick={(e) => { e.stopPropagation(); alert("Terms of Service"); }} style={inlineLinkStyle}>
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span onClick={(e) => { e.stopPropagation(); alert("Privacy Policy"); }} style={inlineLinkStyle}>
                    Privacy Policy
                  </span>
                </CustomCheckbox>
                <FieldError>{fieldErrors.acceptedTerms}</FieldError>

                <CustomCheckbox checked={confirmedAuthority} onClick={() => setConfirmedAuthority((v) => !v)}>
                  I confirm I am an authorized emergency response professional or student researcher
                </CustomCheckbox>
                <FieldError>{fieldErrors.confirmedAuthority}</FieldError>

                <CustomCheckbox checked={wantsUpdates} onClick={() => setWantsUpdates((v) => !v)}>
                  Send me updates about LEIN's development and new features
                </CustomCheckbox>
              </div>
            </section>
          </div>

          {error && (
            <div style={{ color: "var(--alert-red)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "12px 16px", fontSize: 14, fontWeight: 800, margin: "28px 0 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <AlertCircle size={18} style={{ flex: "0 0 auto", marginTop: 1 }} />
              {error}
            </div>
          )}

          {message ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center", margin: "30px 0 18px", ...cardFrame(), borderColor: "rgba(16,185,129,0.35)", padding: 24 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                style={{ width: 58, height: 58, borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "var(--safe-green)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}
              >
                <Check size={32} />
              </motion.div>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>Account created! Check your email.</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>We sent a verification code to {email}</p>
            </motion.div>
          ) : (
            <button
              style={{ width: "100%", height: 56, background: "var(--ai-blue)", color: "var(--text-primary)", border: "1px solid var(--ai-blue)", borderRadius: "var(--radius-lg)", fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: error ? 0 : 30 }}
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? <Loader2 className="inline-spin" size={18} /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          )}

          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, marginTop: 22 }}>
            <div>Already have an account?</div>
            <button onClick={() => navigate("/login")} style={{ ...linkButtonStyle, marginTop: 6 }}>
              Sign in to LEIN →
            </button>
          </div>

          <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginTop: 24, display: "flex", justifyContent: "center", gap: 8, lineHeight: 1.5 }}>
            <Lock size={15} style={{ flex: "0 0 auto", marginTop: 2 }} />
            <span>Your data is encrypted and secure. We never share your information.</span>
          </div>
        </div>
      </motion.main>
    </div>
  );
}

function StepIndicator({ label, active, showLine }) {
  return (
    <>
      <div style={{ display: "grid", justifyItems: "center", gap: 8 }}>
        <span style={{ width: 14, height: 14, borderRadius: 999, background: active ? "var(--ai-blue)" : "var(--text-muted)", boxShadow: active ? "0 0 18px var(--ai-blue-glow)" : "none" }} />
        <span style={{ color: active ? "var(--ai-blue)" : "var(--text-muted)", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" }}>{label}</span>
      </div>
      {showLine && <div style={{ height: 1, background: "var(--border-bright)", alignSelf: "start", marginTop: 7 }} />}
    </>
  );
}

function PasswordToggle({ visible, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={visible ? "Hide password" : "Show password"}
      style={{ position: "absolute", right: 6, top: 7, width: 40, height: 40, padding: 0, background: "transparent", color: "var(--text-muted)", border: 0, cursor: "pointer" }}
    >
      {visible ? <EyeOff size={19} /> : <Eye size={19} />}
    </button>
  );
}

function cardFrame() {
  return {
    background: "var(--bg-panel)",
    border: "1px solid var(--border-bright)",
    borderRadius: "var(--radius-lg)",
  };
}

const linkButtonStyle = {
  background: "transparent",
  border: 0,
  padding: 0,
  color: "var(--ai-blue)",
  fontWeight: 900,
  cursor: "pointer",
};

const inlineLinkStyle = {
  color: "var(--ai-blue)",
  textDecoration: "underline",
  fontWeight: 900,
};
