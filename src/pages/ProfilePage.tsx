import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { LogOut, Key, User as UserIcon } from "lucide-react";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Profile · Smart Docs";
    if (user?.user_metadata) {
      setName(user.user_metadata.name || user.user_metadata.full_name || "");
      setPhone(user.user_metadata.phone || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { name, phone, full_name: name }
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully");
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent");
    }
  };

  const userInitials = (name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Profile</h1>
      </div>

      <div className="space-y-6 pb-20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Avatar className="h-20 w-20 bg-primary text-primary-foreground text-2xl">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="font-semibold text-lg">{name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" /> Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              A password reset link will be sent to your registered email address.
            </p>
            <Button variant="outline" className="w-full" onClick={handleResetPassword}>
              Send Password Reset Email
            </Button>
          </CardContent>
        </Card>

        <div className="pt-4 flex flex-col items-center space-y-4">
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <Button variant="destructive" className="w-full" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
