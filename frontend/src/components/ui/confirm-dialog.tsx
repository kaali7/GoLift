
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "destructive" | "warning";
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "destructive",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-card border border-border/50 p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300",
        )}
      >
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon Header */}
          <div className={cn(
             "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
             variant === "destructive" ? "bg-red-50 text-red-500 shadow-red-500/10" : "bg-amber-50 text-amber-500 shadow-amber-500/10"
          )}>
             {variant === "destructive" ? <Trash2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black font-heading tracking-tighter uppercase italic">{title}</h3>
            <p className="text-sm text-muted-foreground font-medium">{description}</p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
             <Button 
                onClick={onConfirm} 
                className={cn(
                  "h-14 rounded-2xl font-black text-lg uppercase tracking-wider shadow-lg",
                  variant === "destructive" ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                )}
             >
                {confirmLabel}
             </Button>
             <Button 
                variant="ghost" 
                onClick={onCancel}
                className="h-12 rounded-2xl font-bold text-muted-foreground hover:bg-muted/50"
             >
                {cancelLabel}
             </Button>
          </div>
        </div>

        {/* Close Corner */}
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
