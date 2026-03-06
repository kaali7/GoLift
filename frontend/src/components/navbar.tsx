import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { UserCircle, Settings, LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold font-heading track-tight text-primary hover:text-primary/90 transition-colors">
            GoLift
          </Link>


          <div className="flex items-center gap-3">
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <Button 
                    variant="ghost" 
                    className="font-medium gap-2 rounded-full pl-2 pr-4 border hover:bg-muted"
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background">
                        {user.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden md:inline">{user.full_name?.split(" ")[0]}</span>
                </Button>

                {/* Custom Dropdown */}
                {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 z-50">
                         <Link to="/profile" onClick={() => setShowDropdown(false)}>
                             <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                                 <UserCircle className="w-4 h-4 text-muted-foreground" />
                                 Profile
                             </div>
                         </Link>
                         <Link to="/settings" onClick={() => setShowDropdown(false)}>
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                                  <Settings className="w-4 h-4 text-muted-foreground" />
                                  Settings
                              </div>
                         </Link>
                         <div className="h-px bg-border my-1" />
                         <button 
                             className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm font-medium text-left"
                             onClick={() => logout()}
                         >
                              <LogOut className="w-4 h-4" />
                              Logout
                         </button>
                     </div>
                 )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="font-medium">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="font-medium">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}


