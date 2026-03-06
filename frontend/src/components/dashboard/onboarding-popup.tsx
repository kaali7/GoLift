import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { X, ChevronRight, Check, Ruler, Weight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingPopupProps {
  onComplete: () => void;
  onClose: () => void;
}

export function OnboardingPopup({ onComplete, onClose }: OnboardingPopupProps) {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    date_of_birth: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    fitness_level: "beginner",
    primary_goal: "weight_loss",
    experience_months: "0",
  });

  const [bodyFat, setBodyFat] = useState<number | null>(null);

  // Calculate Body Fat (Deurenberg Formula)
  // Adult Body Fat % = (1.20 × BMI) + (0.23 × Age) − (10.8 × sex) − 5.4
  // sex: male = 1, female = 0
  useEffect(() => {
    if (formData.height_cm && formData.weight_kg && formData.date_of_birth && formData.gender) {
      const heightInM = parseFloat(formData.height_cm) / 100;
      const weight = parseFloat(formData.weight_kg);
      const bmi = weight / (heightInM * heightInM);
      
      const birthDate = new Date(formData.date_of_birth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      const sex = formData.gender === "male" ? 1 : 0;
      
      if (!isNaN(bmi) && !isNaN(age)) {
        const bf = (1.20 * bmi) + (0.23 * age) - (10.8 * sex) - 5.4;
        setBodyFat(Math.round(bf * 10) / 10);
      }
    }
  }, [formData]);

  const handleNext = () => {
    if (step < totalSteps) {
      setDirection('right');
      setTimeout(() => {
        setStep(step + 1);
        setDirection(null);
      }, 300);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection('left');
      setTimeout(() => {
        setStep(step - 1);
        setDirection(null);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Update User Full Name if changed
      if (formData.full_name !== user?.full_name) {
        await api.patch("/v1/users/me", { full_name: formData.full_name });
        updateUser({ full_name: formData.full_name });
      }

      // 2. Create/Update Profile
      const profilePayload = {
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        fitness_level: formData.fitness_level,
        primary_goal: formData.primary_goal,
        experience_months: parseInt(formData.experience_months)
      };

      try {
        await api.patch("/v1/users/me/profile", profilePayload);
      } catch {
        await api.post("/v1/users/me/profile", profilePayload);
      }

      // 3. Save calculated body fat as a measurement
      if (bodyFat) {
        const today = new Date().toISOString().split('T')[0];
        await api.post("/v1/users/me/body-metrics", {
          measurement_date: today,
          body_fat_pct: bodyFat,
          notes: "Calculated during onboarding"
        });
      }

      onComplete();
    } catch (err) {
      console.error("Failed to save onboarding data", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black font-heading italic uppercase tracking-tighter">Let's get started</h2>
              <p className="text-sm text-muted-foreground font-medium">Tell us a bit about yourself</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                <Input 
                  className="h-12 rounded-xl bg-muted/50 border-none focus:bg-muted text-base font-bold"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Date</Label>
                <Input 
                  type="date"
                  className="h-12 rounded-xl bg-muted/50 border-none focus:bg-muted text-base font-bold"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({...formData, gender: g})}
                      className={cn(
                        "h-12 rounded-xl border-2 font-bold capitalize transition-all",
                        formData.gender === g ? "border-primary bg-primary/5 text-primary" : "border-muted-foreground/10 hover:bg-muted"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black font-heading italic uppercase tracking-tighter">Your stats</h2>
              <p className="text-sm text-muted-foreground font-medium">To calculate your body metrics</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Height (cm)</Label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="number"
                      className="h-12 pl-12 rounded-xl bg-muted/50 border-none focus:bg-muted text-lg font-bold"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Weight (kg)</Label>
                  <div className="relative">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="number"
                      className="h-12 pl-12 rounded-xl bg-muted/50 border-none focus:bg-muted text-lg font-bold"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {bodyFat !== null && (
                <Card className="rounded-2xl border-none bg-primary/5 p-4 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Estimated Body Fat</p>
                      <p className="text-2xl font-black font-heading text-primary italic leading-none">{bodyFat}%</p>
                    </div>
                    <Activity className="w-8 h-8 text-primary/30" />
                  </div>
                </Card>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black font-heading italic uppercase tracking-tighter">Fitness Goal</h2>
              <p className="text-sm text-muted-foreground font-medium">Customize your experience</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setFormData({...formData, fitness_level: l})}
                      className={cn(
                        "h-10 rounded-lg text-[10px] font-black uppercase tracking-tight border transition-all",
                        formData.fitness_level === l ? "border-primary bg-primary/5 text-primary" : "border-muted-foreground/10 hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Goal</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['weight_loss', 'muscle_gain', 'strength', 'endurance'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({...formData, primary_goal: g})}
                      className={cn(
                        "h-10 rounded-lg text-[10px] font-black uppercase tracking-tight border transition-all",
                        formData.primary_goal === g ? "border-primary bg-primary/5 text-primary" : "border-muted-foreground/10 hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {g.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Exp (Months)</Label>
                <Input 
                  type="number"
                  className="h-12 rounded-xl bg-muted/50 border-none focus:bg-muted text-base font-bold"
                  value={formData.experience_months}
                  onChange={(e) => setFormData({...formData, experience_months: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md rounded-[2.5rem] border-none shadow-premium relative overflow-hidden bg-card">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 p-0 px-8 mt-6">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                s <= step ? "bg-primary flex-1" : "bg-muted w-4"
              )} 
            />
          ))}
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-6 right-6 rounded-full w-10 h-10 text-muted-foreground/50 hover:bg-muted"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <CardContent className="p-8 pt-16 h-[500px] flex flex-col justify-between">
          <div className={cn(
            "flex-1 transition-all duration-300",
            direction === 'right' ? "-translate-x-full opacity-0" : 
            direction === 'left' ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
          )}>
            {renderStep()}
          </div>

          <div className="flex items-center gap-4 mt-8">
            {step > 1 ? (
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="h-14 font-black uppercase italic tracking-tighter text-muted-foreground"
              >
                Back
              </Button>
            ) : <div className="flex-1" />}
            
            <Button 
              onClick={handleNext}
              disabled={loading}
              className="flex-1 h-14 rounded-2xl font-black uppercase italic tracking-wider text-lg shadow-premium"
            >
              {loading ? "Saving..." : step === totalSteps ? (
                <span className="flex items-center gap-2">Ready <Check className="w-5 h-5" /></span>
              ) : (
                <span className="flex items-center gap-2">Next <ChevronRight className="w-5 h-5" /></span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
