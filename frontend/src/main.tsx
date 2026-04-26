import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import { ProtectedRoute, PublicOnly } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { Landing } from "./pages/Landing";
import { AuthPage } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { Categories } from "./pages/Categories";
import { Budget } from "./pages/Budget";
import { Reports } from "./pages/Reports";
import { Recurring } from "./pages/Recurring";
import { AiBuddy } from "./pages/AiBuddy";
import { Settings } from "./pages/Settings";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
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
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
