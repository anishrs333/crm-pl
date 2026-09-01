import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import MainLayout from "../components/layouts/MainLayout";

import Dashboard from "../pages/dashboard/Dashboard";

import Leads from "../pages/leads/Leads";


function PlaceholderPage({ title }) {

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1 className="page-title">
                        {title}
                    </h1>

                    <p className="page-description">
                        This module is being developed.
                    </p>
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
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />


                <Route
                    path="/dashboard"
                    element={
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    }
                />


                <Route
                    path="/leads"
                    element={
                        <MainLayout>
                           <Leads />
                        </MainLayout>
                    }
                />


                <Route
                    path="/customers"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Customers" />
                        </MainLayout>
                    }
                />


                <Route
                    path="/opportunities"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Opportunities" />
                        </MainLayout>
                    }
                />


                <Route
                    path="/activities"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Activities" />
                        </MainLayout>
                    }
                />


                <Route
                    path="/tasks"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Tasks" />
                        </MainLayout>
                    }
                />


                <Route
                    path="/quotations"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Quotations" />
                        </MainLayout>
                    }
                />


                <Route
                    path="/products"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Products" />
                        </MainLayout>
                    }
                />


                <Route
                    path="/employees"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Employees" />
                        </MainLayout>
                    }
                />


                <Route
                    path="/reports"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Reports" />
                        </MainLayout>
                    }
                />


                <Route
                    path="/notifications"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Notifications" />
                        </MainLayout>
                    }
                />


                <Route
                    path="/settings"
                    element={
                        <MainLayout>
                            <PlaceholderPage title="Settings" />
                        </MainLayout>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default AppRoutes;