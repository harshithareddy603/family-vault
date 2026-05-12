import { Navigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { SplashScreen } from "@/components/SplashScreen";
import { useEffect, useState } from "react";

const Index = () => {
  const { isAuthenticated, loading } = useSession();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || showSplash) return <SplashScreen />;
  return <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />;
};

export default Index;
