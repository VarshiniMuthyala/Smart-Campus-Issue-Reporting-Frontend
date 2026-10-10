import { useState } from "react";
import api from "../services/api";
import FixoraLogo from "../components/FixoraLogo";

function Login({ onLogin, onSwitchToSignup, onForgotPassword }) {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [rememberMe, setRememberMe] =
        useState(true);

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response =
                await api.post(
                    "/auth/login",
                    {
                        email: email.trim(),
                        password
                    }
                );

            const data =
                response.data;

            if (
                !data ||
                !data.token ||
                !data.role
            ) {
                throw new Error(
                    "Invalid login response."
                );
            }


            const loggedUser = {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role
            };


            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(
                    loggedUser
                )
            );


            if (onLogin) {
                onLogin(
                    loggedUser,
                    data.token
                );
            }

        } catch (err) {

            console.error(
                "Login error:",
                err
            );

            const serverMessage =
                err.response?.data;

            if (
                typeof serverMessage ===
                "string"
            ) {

                setError(
                    serverMessage
                );

            } else if (
                serverMessage?.message
            ) {

                setError(
                    serverMessage.message
                );

            } else {

                setError(
                    "Invalid email or password."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="auth-container">

            <div className="auth-card">

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
                    <FixoraLogo size={38} showText={true} />
                </div>

                <p className="auth-subtitle">
                    Institutional Complaint &amp; Resolution Platform
                </p>


                <h2>
                    Account Login
                </h2>


                <form
                    onSubmit={handleLogin}
                >

                    {/* EMAIL */}

                    <label htmlFor="login-email">
                        Email Address
                    </label>

                    <input
                        id="login-email"
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        required
                    />


                    {/* PASSWORD */}

                    <div className="auth-label-row">
                        <label htmlFor="login-password">
                            Password
                        </label>
                    </div>

                    <div className="input-with-icon" style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            required
                            style={{ paddingRight: "44px" }}
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
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* REMEMBER ME & FORGOT PASSWORD */}
                    <div
                        className="login-options-row"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "14px 0 18px",
                            flexWrap: "wrap",
                            gap: "8px"
                        }}
                    >
                        <label
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "13px",
                                color: "#A1A1AA",
                                cursor: "pointer",
                                margin: 0,
                                userSelect: "none"
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{
                                    accentColor: "#D4AF37",
                                    width: "16px",
                                    height: "16px",
                                    cursor: "pointer",
                                    margin: 0
                                }}
                            />
                            Remember Me
                        </label>

                        {onForgotPassword && (
                            <button
                                type="button"
                                className="forgot-password-link"
                                onClick={onForgotPassword}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#F5D76E",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    padding: 0,
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    transition: "color 0.2s ease"
                                }}
                            >
                                Forgot Password?
                            </button>
                        )}
                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {/* LOGIN */}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>


                {/* SIGNUP */}

                <p className="switch-auth">

                    Don't have an account?

                    <button
                        type="button"
                        onClick={
                            onSwitchToSignup
                        }
                    >
                        Sign Up
                    </button>

                </p>

            </div>

        </div>
    );
}

export default Login;