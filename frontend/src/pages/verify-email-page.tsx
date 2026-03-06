import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";

export function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email not found. Please try registering again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/v1/auth/verify", { email, verification_code: code });
      setMessage("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Verification failed. Please check the code.");
      } else {
        setError("Verification failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/v1/auth/resend_verification_code", { email });
      setMessage("New verification code sent!");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Failed to resend code.");
      } else {
        setError("Failed to resend code. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-8 shadow-soft">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-heading">Verify Your Email</h1>
          <p className="mt-2 text-text-secondary font-body">
            Enter the 4-digit code sent to <b>{email || "your email"}</b>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium font-body mb-2 text-center">Verification Code</label>
              <input
                type="text"
                required
                maxLength={4}
                className="w-full rounded-xl border bg-background px-4 py-3 text-center text-2xl font-bold tracking-widest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
          {message && <p className="text-sm font-medium text-primary text-center">{message}</p>}

          <Button type="submit" className="w-full font-body" disabled={loading || code.length !== 4}>
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center font-body">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-sm font-medium text-primary hover:underline"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
