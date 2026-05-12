import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { LogOut, Key, User as UserIcon } from "lucide-react";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Profile · Smart Docs";
    if (user?.user_metadata) {
      setName(user.user_metadata.name || user.user_metadata.full_name || "");
      setPhone(user.user_metadata.phone || "");
      setBloodGroup(user.user_metadata.blood_group || "");
      setAddress(user.user_metadata.address || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { name, phone, full_name: name, blood_group: bloodGroup, address }
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
          <Dialog>
            <DialogTrigger>
              <Avatar className="h-24 w-24 bg-primary text-primary-foreground text-3xl shadow-md border-4 border-white cursor-pointer transition-transform hover:scale-105">
                {user?.user_metadata?.avatar_url ? (
                  <AvatarImage src={user.user_metadata.avatar_url} className="object-cover object-[center_20%]" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{userInitials}</AvatarFallback>
                )}
              </Avatar>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none flex justify-center">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full max-w-sm rounded-xl object-contain bg-black/50" />
              ) : (
                <div className="h-64 w-64 bg-primary rounded-xl flex items-center justify-center text-6xl text-white font-bold">{userInitials}</div>
              )}
            </DialogContent>
          </Dialog>
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
              <div className="space-y-2">
                <Label>Blood Group (optional)</Label>
                <Input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="e.g. O+" />
              </div>
              <div className="space-y-2">
                <Label>Address (optional)</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
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
          <p className="text-xs text-muted-foreground">Version 1.0.1</p>
          <Button variant="destructive" className="w-full" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
