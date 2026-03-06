import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
    User, 
    Lock, 
    Palette, 
    Ruler, 
    ChevronLeft, 
    ChevronRight,
    CheckCircle, 
    XCircle,
    Loader2,
    Sun,
    Moon,
    Laptop,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsPage() {
    const { user, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Internal navigation state: 'list' | 'profile' | 'metrics' | 'security' | 'appearance'
    const [view, setView] = useState<string>("list");

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && ["profile", "metrics", "security", "system"].includes(tab)) {
            setView(tab === "system" ? "appearance" : tab);
        } else {
            setView("list");
        }
    }, [searchParams]);

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [profileForm, setProfileForm] = useState({
        full_name: user?.full_name || "",
        height_cm: "",
        weight_kg: "",
        date_of_birth: "",
        gender: "",
        fitness_level: "",
        primary_goal: "",
        experience_months: ""
    });

    // Metrics State
    const [metricsForm, setMetricsForm] = useState({
        body_fat_pct: "",
        muscle_mass_kg: "",
        chest_cm: "",
        waist_cm: "",
        hips_cm: "",
        notes: ""
    });

    // Password State
    const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, metricsRes] = await Promise.all([
                    api.get("/v1/users/me/profile").catch(() => ({ data: null })),
                    api.get("/v1/users/me/body-metrics").catch(() => ({ data: null }))
                ]);

                if (profileRes.data) {
                    setProfileForm({
                        full_name: user?.full_name || "",
                        height_cm: profileRes.data.height_cm?.toString() || "",
                        weight_kg: profileRes.data.weight_kg?.toString() || "",
                        date_of_birth: profileRes.data.date_of_birth || "",
                        gender: profileRes.data.gender || "",
                        fitness_level: profileRes.data.fitness_level || "",
                        primary_goal: profileRes.data.primary_goal || "",
                        experience_months: profileRes.data.experience_months?.toString() || ""
                    });
                }

                if (metricsRes.data) {
                    setMetricsForm({
                        body_fat_pct: metricsRes.data.body_fat_pct?.toString() || "",
                        muscle_mass_kg: metricsRes.data.muscle_mass_kg?.toString() || "",
                        chest_cm: metricsRes.data.chest_cm?.toString() || "",
                        waist_cm: metricsRes.data.waist_cm?.toString() || "",
                        hips_cm: metricsRes.data.hips_cm?.toString() || "",
                        notes: metricsRes.data.notes || ""
                    });
                }
            } catch (err) {
                console.error("Failed to load settings data", err);
            }
        };

        fetchData();
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            if (profileForm.full_name !== user?.full_name) {
                await api.patch("/v1/users/me", { full_name: profileForm.full_name });
                updateUser({ full_name: profileForm.full_name });
            }
            const profilePayload = {
                height_cm: parseFloat(profileForm.height_cm) || 0,
                weight_kg: parseFloat(profileForm.weight_kg) || 0,
                date_of_birth: profileForm.date_of_birth || undefined,
                gender: profileForm.gender || undefined,
                fitness_level: profileForm.fitness_level || undefined,
                primary_goal: profileForm.primary_goal || undefined,
                experience_months: parseInt(profileForm.experience_months) || 0
            };
            try {
                await api.patch("/v1/users/me/profile", profilePayload);
            } catch {
                await api.post("/v1/users/me/profile", profilePayload);
            }
            setMsg({ type: 'success', text: "Profile updated successfully" });
        } catch (err) {
            const error = err as AxiosError<{ detail: string }>;
            setMsg({ type: 'error', text: error.response?.data?.detail || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMetrics = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            const today = new Date().toISOString().split('T')[0];
            const metricsPayload = {
                measurement_date: today,
                body_fat_pct: parseFloat(metricsForm.body_fat_pct) || 0,
                muscle_mass_kg: parseFloat(metricsForm.muscle_mass_kg) || undefined,
                chest_cm: parseFloat(metricsForm.chest_cm) || undefined,
                waist_cm: parseFloat(metricsForm.waist_cm) || undefined,
                hips_cm: parseFloat(metricsForm.hips_cm) || undefined,
                notes: metricsForm.notes || undefined
            };
            try {
                await api.patch("/v1/users/me/body-metrics", metricsPayload);
            } catch {
                await api.post("/v1/users/me/body-metrics", metricsPayload);
            }
            setMsg({ type: 'success', text: "Body metrics updated successfully" });
        } catch (err) {
            const error = err as AxiosError<{ detail: string }>;
            setMsg({ type: 'error', text: error.response?.data?.detail || "Failed to update metrics" });
        } finally {
            setLoading(false);
        }
    };

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

    const handleGoBack = () => {
        if (view === "list") {
            navigate("/profile");
        } else {
            setSearchParams({});
            setView("list");
            setMsg(null);
        }
    };

    const renderListView = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="rounded-xl">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-black font-heading uppercase italic tracking-tighter">Settings</h1>
            </header>

            {/* Profile Glance Card */}
            <Card className="rounded-[2rem] border-none shadow-soft overflow-hidden bg-card/40 backdrop-blur-md p-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg text-primary overflow-hidden shrink-0">
                        <User className="w-12 h-12" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black font-heading uppercase italic tracking-tighter leading-none">{user?.full_name}</h2>
                        <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
                    </div>
                </div>
            </Card>

            {/* Account Settings Group */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4">Account</h3>
                <Card className="rounded-[2rem] border-none shadow-soft overflow-hidden divide-y divide-border/30 bg-card/40 backdrop-blur-md">
                    <button 
                        onClick={() => setSearchParams({ tab: "profile" })}
                        className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100/50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-base">Manage Profile</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                        onClick={() => setSearchParams({ tab: "security" })}
                        className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-100/50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                <Lock className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-base">Password & Security</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                        onClick={() => setSearchParams({ tab: "metrics" })}
                        className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-100/50 dark:bg-green-900/20 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <Ruler className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-base">Body Metrics</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:translate-x-1 transition-transform" />
                    </button>
                </Card>
            </div>

            {/* Preferences Group */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4">Preferences</h3>
                <Card className="rounded-[2rem] border-none shadow-soft overflow-hidden divide-y divide-border/30 bg-card/40 backdrop-blur-md">
                    <button 
                        onClick={() => setSearchParams({ tab: "system" })}
                        className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-100/50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                <Palette className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="font-bold text-base block">Appearance</span>
                                <span className="text-xs text-muted-foreground capitalize font-medium">{theme} theme</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:translate-x-1 transition-transform" />
                    </button>
                </Card>
            </div>
        </div>
    );

    const renderDetailView = (title: string, content: React.ReactNode) => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleGoBack} className="rounded-xl">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-black font-heading uppercase italic tracking-tighter">{title}</h1>
            </header>

            <Card className="rounded-[2.5rem] border-none shadow-premium overflow-hidden bg-card">
                <CardContent className="p-8">
                    {msg && (
                        <div className={cn(
                            "mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2",
                            msg.type === 'success' ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                        )}>
                            {msg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            <p className="text-sm font-bold uppercase tracking-tight italic">{msg.text}</p>
                        </div>
                    )}
                    {content}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto p-4 md:p-8 space-y-8 pb-32">
            {view === "list" && renderListView()}
            
            {view === "profile" && renderDetailView("Profile Info", (
                <form onSubmit={handleSaveProfile} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="full_name" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Full Name</Label>
                            <Input 
                                id="full_name" 
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                                value={profileForm.full_name} 
                                onChange={e => setProfileForm({...profileForm, full_name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="height_cm" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Height (cm)</Label>
                                <Input 
                                    id="height_cm" type="number"
                                    className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                                    value={profileForm.height_cm} 
                                    onChange={e => setProfileForm({...profileForm, height_cm: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="weight_kg" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Weight (kg)</Label>
                                <Input 
                                    id="weight_kg" type="number"
                                    className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                                    value={profileForm.weight_kg} 
                                    onChange={e => setProfileForm({...profileForm, weight_kg: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="dob" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Birth Date</Label>
                                <Input 
                                    id="dob" type="date"
                                    className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-base font-bold"
                                    value={profileForm.date_of_birth} 
                                    onChange={e => setProfileForm({...profileForm, date_of_birth: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Gender</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['male', 'female'].map(g => (
                                        <button
                                            key={g} type="button"
                                            onClick={() => setProfileForm({...profileForm, gender: g})}
                                            className={cn(
                                                "h-14 rounded-2xl border-2 font-bold capitalize transition-all",
                                                profileForm.gender === g ? "border-primary bg-primary/5 text-primary" : "border-muted-foreground/10 hover:bg-muted"
                                            )}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Fitness Level</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {['beginner', 'intermediate', 'advanced'].map(l => (
                                    <button
                                        key={l} type="button"
                                        onClick={() => setProfileForm({...profileForm, fitness_level: l})}
                                        className={cn(
                                            "h-12 rounded-xl text-[10px] font-black uppercase tracking-tight border-2 transition-all",
                                            profileForm.fitness_level === l ? "border-primary bg-primary/5 text-primary" : "border-muted-foreground/10 hover:bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Training Goal</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['weight_loss', 'muscle_gain', 'strength', 'endurance'].map(g => (
                                    <button
                                        key={g} type="button"
                                        onClick={() => setProfileForm({...profileForm, primary_goal: g})}
                                        className={cn(
                                            "h-12 rounded-xl text-[10px] font-black uppercase tracking-tight border-2 transition-all",
                                            profileForm.primary_goal === g ? "border-primary bg-primary/5 text-primary" : "border-muted-foreground/10 hover:bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {g.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="experience" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Experience (Months)</Label>
                            <Input 
                                id="experience" type="number"
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                                value={profileForm.experience_months} 
                                onChange={e => setProfileForm({...profileForm, experience_months: e.target.value})}
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg shadow-premium">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : null}
                        Update Profile
                    </Button>
                </form>
            ))}

            {view === "metrics" && renderDetailView("Body Metrics", (
                <form onSubmit={handleSaveMetrics} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="body_fat_pct" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Body Fat (%)</Label>
                            <Input 
                                id="body_fat_pct" type="number" step="0.1"
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                                value={metricsForm.body_fat_pct} 
                                onChange={e => setMetricsForm({...metricsForm, body_fat_pct: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="muscle_mass_kg" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Muscle Mass (kg)</Label>
                            <Input 
                                id="muscle_mass_kg" type="number" step="0.1"
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                                value={metricsForm.muscle_mass_kg} 
                                onChange={e => setMetricsForm({...metricsForm, muscle_mass_kg: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="chest_cm" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Chest (cm)</Label>
                            <Input 
                                id="chest_cm" type="number"
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                                value={metricsForm.chest_cm} 
                                onChange={e => setMetricsForm({...metricsForm, chest_cm: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="waist_cm" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Waist (cm)</Label>
                            <Input 
                                id="waist_cm" type="number"
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                                value={metricsForm.waist_cm} 
                                onChange={e => setMetricsForm({...metricsForm, waist_cm: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="hips_cm" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Hips (cm)</Label>
                            <Input 
                                id="hips_cm" type="number"
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                                value={metricsForm.hips_cm} 
                                onChange={e => setMetricsForm({...metricsForm, hips_cm: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Additional Notes</Label>
                        <Textarea 
                            id="notes" 
                            className="rounded-[1.5rem] border-none bg-muted/50 focus:bg-muted transition-colors p-4 min-h-[120px]"
                            value={metricsForm.notes} 
                            onChange={e => setMetricsForm({...metricsForm, notes: e.target.value})}
                            placeholder="Progress insights..."
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg shadow-premium">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : null}
                        Update Metrics
                    </Button>
                </form>
            ))}

            {view === "security" && renderDetailView("Security", (
                <form onSubmit={handlePasswordChange} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="old_pass" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Current Password</Label>
                            <Input 
                                id="old_pass" type="password" 
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors"
                                value={passwords.old} 
                                onChange={e => setPasswords({...passwords, old: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="new_pass" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">New Password</Label>
                            <Input 
                                id="new_pass" type="password" 
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors"
                                value={passwords.new} 
                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="confirm_pass" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Confirm New Password</Label>
                            <Input 
                                id="confirm_pass" type="password" 
                                className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors"
                                value={passwords.confirm} 
                                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={loading || !passwords.old || !passwords.new} className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg shadow-premium">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : null}
                        Change Password
                    </Button>
                </form>
            ))}

            {view === "appearance" && renderDetailView("Appearance", (
                <div className="space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Color Scheme</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { id: 'light', icon: Sun, label: 'Light', color: 'text-amber-500', bg: 'bg-white' },
                            { id: 'dark', icon: Moon, label: 'Dark', color: 'text-primary', bg: 'bg-zinc-900' },
                            { id: 'system', icon: Laptop, label: 'System', color: 'text-muted-foreground', bg: 'bg-muted' }
                        ].map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => setTheme(item.id as "light" | "dark" | "system")}
                                className={cn(
                                    "flex flex-col items-center gap-4 p-4 rounded-[2rem] border-2 transition-all duration-300",
                                    theme === item.id ? "border-primary bg-primary/5 shadow-soft" : "border-transparent hover:bg-muted"
                                )}
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform duration-500",
                                    item.bg,
                                    theme === item.id ? "scale-110" : "group-hover:scale-110",
                                    item.id === 'light' ? 'border' : item.id === 'dark' ? 'border border-zinc-800' : ''
                                )}>
                                    <item.icon className={cn("w-8 h-8", item.color)} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
