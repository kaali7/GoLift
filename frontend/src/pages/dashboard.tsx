import { useState, useEffect, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { TrainingTab } from "@/components/dashboard/training-tab";
import { InsightsTab } from "@/components/dashboard/insights-tab";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { BottomNav } from "@/components/bottom-nav";
import { OnboardingPopup } from "@/components/dashboard/onboarding-popup";
import api from "@/lib/axios";

export function DashboardPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const path = location.pathname;
  const isCreating = searchParams.get('mode') === 'create' || searchParams.get('mode') === 'user' || searchParams.get('mode') === 'template';

  const [showOnboarding, setShowOnboarding] = useState(false);
  const checkProfileStatus = useCallback(async () => {
    try {
      const res = await api.get("/v1/users/me/profile").catch(() => ({ data: null }));
      if (!res.data || !res.data.height_cm || !res.data.weight_kg) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error("Failed to check profile status", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkProfileStatus();
  }, [checkProfileStatus]);

  return (
    <div className="container mx-auto max-w-6xl pt-4 px-4">
      {showOnboarding && (
        <OnboardingPopup 
          onComplete={() => setShowOnboarding(false)} 
          onClose={() => setShowOnboarding(false)} 
        />
      )}
      
      {path === "/training" && <TrainingTab />}
      {path === "/insights" && <InsightsTab />}
      {path === "/profile" && <ProfileTab />}
      {path === "/dashboard" && <TrainingTab />}
      {path === "/" && <TrainingTab />}
      {!isCreating && <BottomNav />}
    </div>
  );
}
