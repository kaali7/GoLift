import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import axios from "axios";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";

export function ProfilePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/v1/auth/change-password", null, {
        params: {
          old_password: passwords.old,
          new_password: passwords.new,
        },
      });
      setMessage("Password changed successfully!");
      setPasswords({ old: "", new: "", confirm: "" });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Failed to change password.");
      } else {
        setError("Failed to change password. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-24 space-y-12">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold font-heading">Account Profile</h2>
        <div className="grid gap-6 rounded-2xl border bg-card p-8 shadow-soft md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Full Name</label>
            <p className="text-lg font-medium font-body">{user.full_name}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Email Address</label>
            <p className="text-lg font-medium font-body">{user.email}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Membership</label>
            <p className="text-lg font-medium font-body capitalize">{user.membership_status}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Role</label>
            <p className="text-lg font-medium font-body capitalize">{user.role}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-12 md:grid-cols-2">
        <section className="space-y-6">
          <h3 className="text-xl font-bold font-heading">Change Password</h3>
          <form className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft" onSubmit={handlePasswordChange}>
            <div>
              <label className="block text-sm font-medium font-body mb-2">Old Password</label>
              <input
                type="password"
                required
                className="w-full rounded-xl border bg-background px-4 py-2 font-body focus:border-primary outline-none transition-all"
                value={passwords.old}
                onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium font-body mb-2">New Password</label>
              <input
                type="password"
                required
                className="w-full rounded-xl border bg-background px-4 py-2 font-body focus:border-primary outline-none transition-all"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium font-body mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                className="w-full rounded-xl border bg-background px-4 py-2 font-body focus:border-primary outline-none transition-all"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive font-body">{error}</p>}
            {message && <p className="text-sm font-medium text-primary font-body">{message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-bold font-heading">Preferences</h3>
          <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-soft">
            <div>
              <label className="block text-sm font-medium font-body mb-4">Theme Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-xl border py-2 text-sm font-medium font-body transition-all ${
                      theme === t ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/50"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
