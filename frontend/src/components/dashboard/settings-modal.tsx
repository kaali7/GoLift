import React, { useState } from "react";
import { AxiosError } from "axios";
import { useTheme } from "@/components/theme-provider";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Laptop, X, CheckCircle, XCircle } from "lucide-react";

export function SettingsModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { theme, setTheme } = useTheme();
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        setMsg({ type: 'error', text: "New passwords do not match" });
        return;
    }
    setLoading(true);
    setMsg(null);
    try {
        await api.post("/v1/auth/change-password", {
            current_password: passwords.old,
            new_password: passwords.new
        });
        setMsg({ type: 'success', text: "Password updated successfully" });
        setPasswords({ old: "", new: "", confirm: "" });
    } catch (err) {
        const error = err as AxiosError<{ detail: string }>;
        setMsg({ type: 'error', text: error.response?.data?.detail || "Failed to update password" });
    } finally {
        setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md m-4 p-6 animate-in zoom-in-95 duration-200 relative">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold font-heading">Settings</h2>
                 <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                     <X className="w-4 h-4" />
                 </Button>
             </div>

             <div className="space-y-6">
                 {/* Theme Section */}
                 <div className="space-y-3">
                     <label className="text-sm font-medium">Appearance</label>
                     <div className="grid grid-cols-3 gap-2">
                         <Button 
                            variant="outline" 
                            className={`justify-start gap-2 ${theme === 'light' ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setTheme('light')}
                         >
                             <Sun className="w-4 h-4" /> Light
                         </Button>
                         <Button 
                            variant="outline" 
                            className={`justify-start gap-2 ${theme === 'dark' ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setTheme('dark')}
                         >
                             <Moon className="w-4 h-4" /> Dark
                         </Button>
                         <Button 
                            variant="outline" 
                            className={`justify-start gap-2 ${theme === 'system' ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setTheme('system')}
                         >
                             <Laptop className="w-4 h-4" /> System
                         </Button>
                     </div>
                 </div>

                 <div className="h-px bg-border my-4" />

                 {/* Password Section */}
                 <form onSubmit={handlePasswordChange} className="space-y-3">
                     <label className="text-sm font-medium">Change Password</label>
                     <div className="space-y-2">
                         <Input 
                            type="password" 
                            placeholder="Current Password" 
                            value={passwords.old}
                            onChange={e => setPasswords({...passwords, old: e.target.value})}
                         />
                         <Input 
                            type="password" 
                            placeholder="New Password" 
                            value={passwords.new}
                            onChange={e => setPasswords({...passwords, new: e.target.value})}
                         />
                         <Input 
                            type="password" 
                            placeholder="Confirm New Password" 
                            value={passwords.confirm}
                            onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                         />
                     </div>
                     
                     {msg && (
                         <div className={`text-xs px-3 py-2 rounded-md flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {msg.type === 'success' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                             {msg.text}
                         </div>
                     )}

                     <div className="flex justify-end pt-2">
                         <Button type="submit" disabled={loading || !passwords.old || !passwords.new}>
                             {loading ? "Updating..." : "Update Password"}
                         </Button>
                     </div>
                 </form>
             </div>
        </div>
    </div>
  )
}
