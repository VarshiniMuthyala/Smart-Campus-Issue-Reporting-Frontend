import { useState, useEffect } from "react";
import api from "../services/api";
import FixoraLogo from "../components/FixoraLogo";

function ResetPassword({ token, onBackToLogin, onResetSuccess }) {

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenError, setTokenError] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [resetComplete, setResetComplete] = useState(false);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token || !token.trim()) {
                setVerifying(false);
                setTokenValid(false);
                setTokenError("No reset token provided. Please use the link from your email.");
                return;
            }

            try {
                setVerifying(true);
                const response = await api.get(`/auth/verify-reset-token?token=${encodeURIComponent(token.trim())}`);
                if (response.data && response.data.valid) {
                    setTokenValid(true);
                    setTokenError("");
                } else {
                    setTokenValid(false);
                    setTokenError("This password reset link is invalid or has expired. Please request a new one.");
                }
            } catch (err) {
                console.error("Token verification error:", err);
                setTokenValid(false);
                setTokenError("Unable to verify reset link. It may have expired or already been used.");
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");

        if (!newPassword) {
            setError("Please enter a new password.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please re-enter.");
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post("/auth/reset-password", {
                token: token.trim(),
                newPassword,
                confirmPassword
            });

            const msg = response.data?.message ||
                "Password reset successfully. You can now log in with your new password.";

            setSuccessMessage(msg);
            setResetComplete(true);

            if (onResetSuccess) {
                onResetSuccess();
            }
        } catch (err) {
            console.error("Reset password error:", err);
            const serverMsg = err.response?.data?.message || err.response?.data;
            if (typeof serverMsg === "string") {
                setError(serverMsg);
            } else {
                setError("Failed to reset password. The link may have expired or been used already.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card reset-password-card">

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
                    <FixoraLogo size={38} showText={true} />
                </div>

                <p className="auth-subtitle">
                    Institutional Complaint &amp; Resolution Platform
                </p>

                <h2>Reset Password</h2>

                {/* VERIFYING TOKEN SPINNER */}
                {verifying && (
                    <div className="auth-verifying-box">
                        <div className="gold-spinner"></div>
                        <p>Verifying reset security token...</p>
                    </div>
                )}

                {/* INVALID / EXPIRED TOKEN */}
                {!verifying && !tokenValid && !resetComplete && (
                    <div className="auth-invalid-token-box">
                        <div className="auth-error-icon">⚠️</div>
                        <h3>Invalid or Expired Link</h3>
                        <p className="auth-error-desc">{tokenError}</p>
                        <button
                            type="button"
                            className="auth-submit-gold"
                            onClick={onBackToLogin}
                            style={{ marginTop: "15px" }}
                        >
                            Back to Login
                        </button>
                    </div>
                )}

                {/* VALID TOKEN - SHOW RESET FORM */}
                {!verifying && tokenValid && !resetComplete && (
                    <>
                        <p className="reset-instruction">
                            Please create a new password for your account.
                        </p>

                        <form onSubmit={handleReset} className="reset-password-form">

                            {/* NEW PASSWORD */}
                            <div className="password-input-wrapper">
                                <label htmlFor="reset-new-password">New Password</label>
                                <div className="input-with-icon">
                                    <input
                                        id="reset-new-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter at least 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="password-input-wrapper">
                                <label htmlFor="reset-confirm-password">Confirm New Password</label>
                                <div className="input-with-icon">
                                    <input
                                        id="reset-confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter your new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        title={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* PASSWORD STRENGTH / CRITERIA CHECK */}
                            <div className="password-criteria-box">
                                <div className={`criteria-item ${newPassword.length >= 6 ? "met" : ""}`}>
                                    {newPassword.length >= 6 ? "✓" : "○"} At least 6 characters
                                </div>
                                <div className={`criteria-item ${newPassword && confirmPassword && newPassword === confirmPassword ? "met" : ""}`}>
                                    {newPassword && confirmPassword && newPassword === confirmPassword ? "✓" : "○"} Passwords match
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-submit-gold"
                                disabled={submitting}
                            >
                                {submitting ? "Resetting Password..." : "Reset Password"}
                            </button>
                        </form>
                    </>
                )}

                {/* SUCCESSFUL RESET */}
                {resetComplete && (
                    <div className="reset-success-box">
                        <span className="reset-success-icon">🎉</span>
                        <h3>Password Reset Successfully!</h3>
                        <p className="reset-success-message">
                            {successMessage || "Password reset successfully. You can now log in with your new password."}
                        </p>
                        <button
                            type="button"
                            className="auth-submit-gold"
                            onClick={onBackToLogin}
                            style={{ marginTop: "20px" }}
                        >
                            Back to Login
                        </button>
                    </div>
                )}

                {!resetComplete && (
                    <div className="switch-auth">
                        <button
                            type="button"
                            className="back-to-login-btn"
                            onClick={onBackToLogin}
                        >
                            ← Back to Login
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ResetPassword;
