import { Navigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

const Index = () => {
  const { isAuthenticated, loading } = useSession();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />;
};

export default Index;
