import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/v1/auth/forgot-password", { email });
      setMessage("A password reset link has been sent to your email! Please check your inbox.");
    } catch (err: unknown) {
      let errorMessage = "Something went wrong. Please try again.";
      if (axios.isAxiosError(err)) {
        if (!err.response) {
            errorMessage = "Cannot connect to server. Please check your internet or if the backend is running.";
        } else {
            errorMessage = err.response?.data?.detail || err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-8 shadow-soft">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-heading">Reset Password</h1>
          <p className="mt-2 text-text-secondary font-body">
            Enter your email to receive reset instructions
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium font-body mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border bg-background px-4 py-2 font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
          {message && <p className="text-sm font-medium text-primary text-center">{message}</p>}

          <Button type="submit" className="w-full font-body" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center text-sm font-body">
            Back to{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
