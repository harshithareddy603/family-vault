import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";
import { SplashScreen } from "@/components/SplashScreen";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (input: { email: string; password: string; name: string; phone?: string }) => Promise<{ error: Error | null }>;
  signIn: (input: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Subscribe FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    // 2) Then load existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp: AuthCtx["signUp"] = useCallback(async ({ email, password, name, phone }) => {
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { name, phone: phone ?? "" },
      },
    });
    return { error: error as Error | null };
  }, []);

  const signIn: AuthCtx["signIn"] = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut }}>
      {loading ? <SplashScreen /> : children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
};
