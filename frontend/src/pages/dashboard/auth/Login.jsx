import React, { useState } from 'react'
import "./Login.css";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

function Login() {

    const navigate = useNavigate();

    const {login} = useAuth();

    const [showPassword, setShowPassword] = useState(false);

    const [userId, setUserId] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e)=>{
        e.preventDefault();

        setError("");

        if(!userId.trim()){
            setError("Please enter your User ID ");
            return;
        }

        if(!password.trim()){
            setError("Please enter your password");
            return;
        }

        setIsSubmitting(true);

        const fakeResponse = {
            access: "temporary-token",
            refresh:"temporary-refresh-token",
            user:{
                id:1,
                userId: userId,
                name: "Admin",
                role: "admin",
            },
        };

        login(fakeResponse);

        setIsSubmitting(false);

        navigate("/dashboard");
        
    };
  return (
    <>
    <div className="login-page">
        <div className="login-container">
            <div className="login-brand">
                <div className="brand-content">
                    <div className="brand-logo">
                        CRM 
                    </div>

                    <h1>
                        Manage your business
                        <span>smarter.</span>
                    </h1>

                    <p>
                        A powerful CRM platform to manage your customers,
                        leads, users and business operations from one place.
                    </p>

                    <div className="brand-features">

                        <div className="brand-feature">
                            <span>✓</span>
                            <p>Manage customers efficiently</p>
                        </div>

                        <div className="brand-feature">
                            <span>✓</span>
                            <p>Track leads and opportunities</p>
                        </div>

                        <div className="brand-feature">
                            <span>✓</span>
                            <p>Role-based secure access</p>
                        </div>

                    </div>

                </div>

            </div>

            <div className="login-form-section">

                <div className="login-form-container">

                    <div className="login-header">
                        <h2>Welcome back</h2>

                        <p>
                            Sign in to your CRM account 
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="userId">
                                User ID  
                            </label>

                            <input 
                              id="userId"
                              type="text"
                              placeholder="Enter your User ID"
                              value={userId}
                              onChange={(e)=>setUserId(e.target.value)}
                              autoComplete="username"
                              
                            />
                        </div>

                        <div className="form-group">
                            <div className="password-label">
                                <label htmlFor="password">
                                    Password 
                                </label>

                                <button 
                                  type="button"
                                  className="forget-password"
                                >
                                    Forgot password?
                                </button>

                            </div>
                            <div className="password-input">

                                <input 
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  value={password}
                                  onChange={(e)=> setPassword(e.target.value)}
                                  autoComplete='current-password'
                                  
                                />

                                <button 
                                  type="button"
                                  className="show-password"
                                  onClick={()=>setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <div className="remember-row">

                            <label>
                                <input type="checkbox" />
                                <span>Remember me </span>
                            </label>
                        </div>

                        <button 
                          type="submit"
                          className="login-button"
                          disabled={isSubmitting}
                        >
                            {isSubmitting
                              ? "Signing in..." : "Sign in" }
                            
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            CRM Management System 
                        </p>
                    </div>

                </div>
            </div>
        </div>
    </div>
    </>
  );
}

export default Login;