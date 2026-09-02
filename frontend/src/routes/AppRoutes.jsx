import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/layouts/MainLayout";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Leads from "../pages/leads/Leads";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function PublicOnlyRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function PlaceholderPage({ title }) {
    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-description">This module is being developed.</p>
                </div>
            </div>
        </div>
    );
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <PublicOnlyRoute>
                            <Login />
                        </PublicOnlyRoute>
                    }
                />

                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Dashboard />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leads"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Leads />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customers"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Customers" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/opportunities"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Opportunities" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/activities"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Activities" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Tasks" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/quotations"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Quotations" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/products"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Products" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employees"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Employees" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Reports" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Notifications" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <PlaceholderPage title="Settings" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;