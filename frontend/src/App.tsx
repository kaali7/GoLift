import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/auth-context";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";
import { VerifyEmailPage } from "@/pages/verify-email-page";
import { ForgotPasswordPage } from "@/pages/forgot-password-page";
import { ResetPasswordPage } from "@/pages/reset-password-page";

import { DashboardPage } from "@/pages/dashboard";
import { SettingsPage } from "@/pages/settings-page";
import { ExerciseDetailPage } from "@/pages/exercise-detail-page";
import { Button } from "@/components/ui/button";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Verifying Session...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();
  
  return (
    <Router>
      <div className="min-h-full bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="pt-16 pb-24">
          <Routes>
            <Route path="/" element={
              user ? <Navigate to="/dashboard" /> : (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center space-y-6">
                  <h1 className="text-6xl font-black font-heading tracking-tighter">
                    LEVEL UP YOUR <span className="text-primary italic">LIFESTYLE</span>
                  </h1>
                  <p className="max-w-xl text-lg text-text-secondary font-body">
                    Track your workouts, metrics, and progress with our state-of-the-art platform.
                  </p>
                  <div className="flex gap-4">
                    <Button size="lg" className="rounded-full px-8 shadow-xl hover:shadow-primary/20 transition-all font-body" asChild>
                      <a href="/register">Get Started</a>
                    </Button>
                  </div>
                </div>
              )
            } />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profile" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/training" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/exercise/:id" element={<ProtectedRoute><ExerciseDetailPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
