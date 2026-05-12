import { useAuth } from "./useAuth";

// Convenience hook — exposes session state for guards/components.
export const useSession = () => {
  const { session, user, loading } = useAuth();
  return { session, user, loading, isAuthenticated: !!session };
};
