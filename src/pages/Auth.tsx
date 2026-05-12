import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";
import { isSupabaseConfigured } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const { isAuthenticated, loading } = useSession();
  const nav = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Sign in · Smart Docs"; }, []);

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      const { error } = await signIn({ email, password });
      if (error) toast.error(error.message);
      else { toast.success("Welcome back!"); nav("/dashboard"); }
    } else {
      if (!photo) {
        toast.error("Profile photo is required.");
        setBusy(false);
        return;
      }
      if (photo.size > 3 * 1024 * 1024) {
        toast.error("Profile photo must be less than 3MB.");
        setBusy(false);
        return;
      }
      const { error } = await signUp({ email, password, name, phone, photo });
      if (error) toast.error(error.message);
      else toast.success("Account created. Check your email to verify (if required).");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero shadow-soft mb-4">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Smart Docs</h1>
          <p className="text-muted-foreground text-sm mt-1">Your family's documents, safely organized.</p>
        </div>

        {!isSupabaseConfigured && (
          <Card className="p-4 mb-4 border-warning/40 bg-warning/5 flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Supabase not configured</p>
              <p className="text-muted-foreground">Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Workspace → Build Secrets, then redeploy.</p>
            </div>
          </Card>
        )}

        <Card className="p-6 shadow-card">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required={mode === "signup"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required={mode === "signup"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo (Max 3MB)</Label>
                  <Input 
                    id="photo" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)} 
                    required={mode === "signup"} 
                  />
                  {photo && photo.size > 3 * 1024 * 1024 && (
                    <p className="text-xs text-destructive">File size exceeds 3MB limit.</p>
                  )}
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>

              <Button type="submit" className="w-full bg-gradient-hero shadow-soft" disabled={busy}>
                {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
              </Button>
            </form>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
