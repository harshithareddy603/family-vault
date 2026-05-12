import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate a loading bar animation
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        const diff = Math.random() * 20;
        return Math.min(oldProgress + diff, 90); // Cap at 90% until actually loaded
      });
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center max-w-xs w-full px-8 animate-in fade-in zoom-in duration-500">
        <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <HardDrive className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-8">
          Smart Docs
        </h1>
        <Progress value={progress} className="h-2 w-full" />
      </div>
    </div>
  );
};
