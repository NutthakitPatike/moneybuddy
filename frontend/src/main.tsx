import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import { ProtectedRoute, PublicOnly } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { Loading } from "./components/Loading";

const Landing = lazy(() => import("./pages/Landing").then((module) => ({ default: module.Landing })));
const AuthPage = lazy(() => import("./pages/Auth").then((module) => ({ default: module.AuthPage })));
const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const Transactions = lazy(() => import("./pages/Transactions").then((module) => ({ default: module.Transactions })));
const Categories = lazy(() => import("./pages/Categories").then((module) => ({ default: module.Categories })));
const Budget = lazy(() => import("./pages/Budget").then((module) => ({ default: module.Budget })));
const Reports = lazy(() => import("./pages/Reports").then((module) => ({ default: module.Reports })));
const Recurring = lazy(() => import("./pages/Recurring").then((module) => ({ default: module.Recurring })));
const AiBuddy = lazy(() => import("./pages/AiBuddy").then((module) => ({ default: module.AiBuddy })));
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<div className="min-h-screen bg-cream p-6 soft-grid"><Loading /></div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<PublicOnly><AuthPage mode="login" /></PublicOnly>} />
              <Route path="/register" element={<PublicOnly><AuthPage mode="register" /></PublicOnly>} />
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="categories" element={<Categories />} />
                <Route path="budget" element={<Budget />} />
                <Route path="reports" element={<Reports />} />
                <Route path="recurring" element={<Recurring />} />
                <Route path="ai" element={<AiBuddy />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
