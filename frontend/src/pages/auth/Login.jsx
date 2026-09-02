import {
    Lock,
    User,
    Eye,
    EyeOff
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!username.trim()) {
            setError("Please enter your user ID.");
            return;
        }

        if (!password.trim()) {
            setError("Please enter your password.");
            return;
        }

        setSubmitting(true);

        try {
            const data = await authService.login(username, password);
            login({
                user: data.user,
                accessToken: data.access,
                refreshToken: data.refresh,
            });
            setSubmitting(false);
            navigate("/dashboard");
        } catch (err) {
            setSubmitting(false);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Login failed. Please check your credentials and server connection.");
            }
        }
    };

    return (
        <div className="login-page">
            {/* Left branding */}
            <section className="login-brand">
                <div className="login-brand-content">
                    <div className="login-logo">P</div>
                    <span className="login-eyebrow">MANAGEMENT SUITE</span>
                    <h1>
                        Manage your business
                        <br />
                        with confidence.
                    </h1>
                    <p>
                        A centralized CRM platform designed to help your team manage leads, customers, sales and relationships.
                    </p>
                    <div className="login-feature-list">
                        <div><span>✓</span> Centralized customer management</div>
                        <div><span>✓</span> Sales pipeline visibility</div>
                        <div><span>✓</span> Team performance tracking</div>
                    </div>
                </div>
            </section>

            {/* Login form */}
            <section className="login-form-section">
                <div className="login-card">
                    <div className="mobile-logo">P</div>
                    <div className="login-heading">
                        <span>WELCOME BACK</span>
                        <h2>Sign in to PL CRM</h2>
                        <p>Enter your credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Username */}
                        <div className="form-group">
                            <label>User ID</label>
                            <div className="input-wrapper">
                                <User size={17} />
                                <input
                                    type="text"
                                    placeholder="Enter your user ID"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={17} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={submitting}
                        >
                            {submitting ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="login-footer">
                        PL CRM · Internal Management System
                    </p>
                </div>
            </section>
        </div>
    );
}

export default Login;