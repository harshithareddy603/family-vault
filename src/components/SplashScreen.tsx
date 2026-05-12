import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { FileDown, Cloud } from "lucide-react";

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
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-[#5b45ff] z-50 text-white">
      <div className="flex-1 flex flex-col items-center justify-center max-w-xs w-full px-8 animate-in fade-in zoom-in duration-500">
        <div className="relative mb-6">
          <FileDown className="h-20 w-20 text-white drop-shadow-md" strokeWidth={1.5} />
          <Cloud className="absolute -bottom-2 -left-2 h-10 w-10 text-[#5b45ff] fill-white drop-shadow-sm" strokeWidth={0} />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-8 drop-shadow-md">
          Smart Docs
        </h1>
        <Progress value={progress} className="h-1.5 w-full bg-white/20 [&>div]:bg-white" />
      </div>
      <div className="pb-10 animate-in fade-in duration-1000 delay-300">
        <p className="text-sm font-medium tracking-wide text-white/90">Doc Base</p>
      </div>
    </div>
  );
};
