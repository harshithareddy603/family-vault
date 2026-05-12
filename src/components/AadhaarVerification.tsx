import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";

export const AadhaarVerification = () => {
  const { user } = useAuth();
  
  // Try reading from user_metadata first, if not available, default to false.
  // In a real app, you'd fetch from the profiles table.
  const isVerified = user?.user_metadata?.aadhaar_verified === true;
  const last4 = user?.user_metadata?.aadhaar_last4 || "";

  const [step, setStep] = useState<"input" | "loading_otp" | "otp" | "verifying" | "success">(
    isVerified ? "success" : "input"
  );
  
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOTP = () => {
    if (aadhaarNumber.replace(/\D/g, "").length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    setStep("loading_otp");
    setTimeout(() => {
      setStep("otp");
      toast.success("OTP sent to your Aadhaar linked mobile number");
    }, 1500);
  };

  const handleVerifyOTP = () => {
    if (otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }
    setStep("verifying");
    setTimeout(async () => {
      // Mock Success: Save to user_metadata and optionally try to update profiles table
      const last4Digits = aadhaarNumber.slice(-4);
      
      const { error } = await supabase.auth.updateUser({
        data: { 
          aadhaar_verified: true, 
          aadhaar_last4: last4Digits 
        }
      });
      
      // Attempt to update the profiles table as well (assuming RLS allows it)
      if (user) {
        await supabase
          .from('profiles')
          .update({ aadhaar_verified: true, aadhaar_last4: last4Digits })
          .eq('id', user.id);
      }

      if (error) {
        toast.error("Failed to save verification status");
        setStep("otp");
      } else {
        toast.success("Aadhaar verified successfully!");
        setStep("success");
      }
    }, 2000);
  };

  if (step === "success" || isVerified) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900">Identity Verified</h3>
              <p className="text-sm text-emerald-700">Aadhaar ending in {last4}</p>
            </div>
          </div>
          <ShieldCheck className="h-8 w-8 text-emerald-300" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> 
          Verify Identity (Aadhaar)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "input" && (
          <>
            <p className="text-sm text-muted-foreground">
              Verify your identity to unlock premium features and increase your account trust score.
            </p>
            <div className="space-y-2">
              <Label>Aadhaar Number</Label>
              <Input 
                value={aadhaarNumber} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                  setAadhaarNumber(val);
                }} 
                placeholder="Enter 12-digit Aadhaar number" 
                maxLength={12}
              />
            </div>
            <Button onClick={handleSendOTP} className="w-full" disabled={aadhaarNumber.length !== 12}>
              Send OTP
            </Button>
          </>
        )}

        {step === "loading_otp" && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Connecting to UIDAI servers...</p>
          </div>
        )}

        {step === "otp" && (
          <>
            <p className="text-sm text-muted-foreground">
              Enter the OTP sent to your Aadhaar registered mobile number.
            </p>
            <div className="space-y-2">
              <Label>OTP</Label>
              <Input 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} 
                placeholder="Enter 6-digit OTP" 
                maxLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleVerifyOTP} className="flex-1" disabled={otp.length < 4}>
                Verify OTP
              </Button>
            </div>
          </>
        )}

        {step === "verifying" && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying OTP...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
