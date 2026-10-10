import { useState } from "react";
import api from "../services/api";
import FixoraLogo from "../components/FixoraLogo";

function ForgotPassword({ onBackToLogin }) {

    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setInfoMessage("");

        if (!email.trim()) {
            setError("Please enter your registered email address.");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/auth/forgot-password", {
                email: email.trim().toLowerCase()
            });

            const msg = response.data?.message ||
                "If the email address is registered, we will send you a password reset link.";

            setInfoMessage(msg);
            setSubmitted(true);
        } catch (err) {
            console.error("Forgot password error:", err);
            // Even on error, do not leak user info; display standard message
            setInfoMessage(
                "If the email address is registered, we will send you a password reset link."
            );
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card forgot-password-card">

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
                    <FixoraLogo size={38} showText={true} />
                </div>

                <p className="auth-subtitle">
                    Institutional Complaint &amp; Resolution Platform
                </p>

                <h2>Forgot Password?</h2>

                {!submitted ? (
                    <>
                        <p className="forgot-instruction">
                            Enter your registered email address and we'll send you a secure link to reset your password.
                        </p>

                        <form onSubmit={handleSubmit} className="forgot-password-form">
                            <label htmlFor="forgot-email">
                                Registered Email
                            </label>
                            <input
                                id="forgot-email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                autoFocus
                            />

                            {error && (
                                <div className="auth-error">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-submit-gold"
                                disabled={loading}
                            >
                                {loading ? "Sending Reset Link..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="forgot-success-container">
                        <div className="forgot-success-box">
                            <span className="forgot-success-icon">✉️</span>
                            <h3>Check Your Email</h3>
                            <p className="forgot-success-text">
                                {infoMessage}
                            </p>
                            <p className="forgot-note">
                                Please check your inbox and spam folder. The password reset link is single-use and will expire in 30 minutes.
                            </p>
                        </div>
                    </div>
                )}

                <div className="switch-auth">
                    <button
                        type="button"
                        className="back-to-login-btn"
                        onClick={onBackToLogin}
                    >
                        ← Back to Login
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ForgotPassword;
