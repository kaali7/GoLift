import { Link, useLocation } from "react-router-dom";
import { TrendingUp, Dumbbell, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    {
      label: "Insights",
      icon: TrendingUp,
      path: "/insights",
    },
    {
      label: "Training",
      icon: Dumbbell,
      path: "/training",
    },
    {
      label: "Profile",
      icon: UserCircle,
      path: "/profile",
    },
  ];

  // Helper to determine if a path is active
  const isActive = (itemPath: string) => {
    if (path === itemPath) return true;
    if (path === "/dashboard" && itemPath === "/training") return true;
    if (path === "/" && itemPath === "/training") return true;
    return false;
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
      <nav className="container mx-auto max-w-md bg-card/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-premium p-2 flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 px-4 rounded-3xl transition-all duration-500 overflow-hidden group",
                active ? "flex-[1.5] bg-primary shadow-lg shadow-primary/20" : "flex-1 text-muted-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative z-10 flex items-center gap-2">
                <item.icon className={cn(
                    "w-6 h-6 transition-all duration-500",
                    active ? "text-white scale-110 stroke-[3px]" : "group-hover:text-primary group-hover:scale-110"
                )} />
                {active && (
                   <span className="text-xs font-black uppercase tracking-widest text-white animate-in slide-in-from-left-2 duration-500">
                     {item.label}
                   </span>
                )}
              </div>
              
              {/* Background Glow for active */}
              {active && (
                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
