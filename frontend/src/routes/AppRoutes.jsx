import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/dashboard/auth/Login";

function AppRoutes() {
  return (
    <Routes>

        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>

      <Route 
        path="/dashboard"
        element={<Dashboard />}
      />
      </Route>

      <Route 
       path="*"
       element={<Navigate to="/login" replace/>}
      />

    </Routes>
  );
}

export default AppRoutes;