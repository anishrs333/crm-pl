import React, { useState } from 'react'
import "./Login.css";

function Login() {

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit =(e)=>{
        e.preventDefault();

        console.log("Login submitted");
        
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
                            <label htmlFor="email">
                                Email address 
                            </label>

                            <input 
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              required
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
                                  required
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

                        <div className="remember-row">
                            <label>
                                <input type="checkbox" />
                                <span>Remember me </span>
                            </label>
                        </div>

                        <button 
                          type="submit"
                          className="login-button"
                        >
                            Sign in 
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