import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember_me: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/v1/auth/login", formData);
      const { access_token, user } = response.data;
      login(access_token, user);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
            setError("Cannot connect to server. Please check your internet or if the backend is running.");
        } else {
            setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
        }
      } else {
        setError("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-8 shadow-soft">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-heading">Welcome Back</h1>
          <p className="mt-2 text-text-secondary font-body">Log in to your GoLift account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium font-body mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border bg-background px-4 py-2 font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium font-body">Password</label>
                <Link to="/forgot-password" title="Forgot Password" className="text-xs font-medium text-primary hover:underline font-body">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                className="w-full rounded-xl border bg-background px-4 py-2 font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={formData.remember_me}
              onChange={(e) => setFormData({ ...formData, remember_me: e.target.checked })}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary font-body">
              Remember me
            </label>
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <Button type="submit" className="w-full font-body" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>

          <div className="text-center text-sm font-body">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
