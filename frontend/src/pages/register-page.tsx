import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/v1/auth/register", formData);
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-8 shadow-soft">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-heading">Join GoLift</h1>
          <p className="mt-2 text-text-secondary font-body">Create your account to start training</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium font-body mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border bg-background px-4 py-2 font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
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
              <label className="block text-sm font-medium font-body mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-xl border bg-background px-4 py-2 font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <Button type="submit" className="w-full font-body" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </Button>

          <div className="text-center text-sm font-body">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
