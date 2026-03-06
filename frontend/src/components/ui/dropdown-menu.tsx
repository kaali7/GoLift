import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined);

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export const DropdownMenuTrigger = ({ children, onClick, ...props }: { children: React.ReactNode, onClick?: (e: React.MouseEvent) => void }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuTrigger must be used within a DropdownMenu");

  const handleToggle = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    context.setOpen(!context.open);
  };

  return <div onClick={handleToggle} className="cursor-pointer" {...props}>{children}</div>
}

export const DropdownMenuContent = ({ children, align = "end", className }: { children: React.ReactNode, align?: "start" | "end", className?: string }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuContent must be used within a DropdownMenu");

  if (!context.open) return null;

  return (
    <div
      className={cn(
        "absolute z-100 mt-2 min-w-32 overflow-hidden rounded-xl border bg-card p-1 text-card-foreground shadow-premium animate-in fade-in zoom-in-95 duration-200",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  )
}

export const DropdownMenuItem = ({ children, className, onClick, ...props }: { children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent) => void }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuItem must be used within a DropdownMenu");

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    context.setOpen(false);
  };

  return (
    <div
      className={cn(
        "relative flex select-none items-center rounded-lg px-2 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-muted focus:bg-muted cursor-pointer",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}
