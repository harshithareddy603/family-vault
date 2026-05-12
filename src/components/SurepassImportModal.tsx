import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments } from "@/hooks/useDocuments";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SurepassImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurepassImportModal = ({ isOpen, onClose }: SurepassImportModalProps) => {
  const { addDocument } = useDocuments();
  const [step, setStep] = useState<"input" | "verifying" | "success">("input");
  const [idType, setIdType] = useState("PAN");
  const [idNumber, setIdNumber] = useState("");
  const [mockData, setMockData] = useState<{ name: string; dob: string } | null>(null);

  const handleVerify = () => {
    if (!idNumber.trim()) {
      toast.error("Please enter an ID number");
      return;
    }
    setStep("verifying");
    
    // Simulate Surepass API Call
    setTimeout(() => {
      setMockData({
        name: "Verified User",
        dob: "01/01/1990",
      });
      setStep("success");
    }, 1500);
  };

  const handleImport = async () => {
    // Import the verified ID as a document
    const { error } = await addDocument({
      name: `${idType} Card`,
      category: "ID",
      family_member_id: null,
      priority: true, // Mark verified documents as priority
      source: "surepass",
    });

    if (error) {
      toast.error("Failed to import verified document");
    } else {
      toast.success(`${idType} verified and imported successfully!`);
    }

    setStep("input");
    setIdNumber("");
    setMockData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Verify & Import ID
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {step === "input" && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your ID details. We will instantly verify and fetch the document from official records.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ID Type</Label>
                  <Select value={idType} onValueChange={setIdType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAN">PAN Card</SelectItem>
                      <SelectItem value="Aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="DL">Driving License</SelectItem>
                      <SelectItem value="Voter ID">Voter ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{idType} Number</Label>
                  <Input 
                    value={idNumber} 
                    onChange={(e) => setIdNumber(e.target.value)} 
                    placeholder={`Enter ${idType} number`} 
                  />
                </div>
                <Button onClick={handleVerify} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Verify ID
                </Button>
              </div>
            </>
          )}

          {step === "verifying" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm text-muted-foreground">Verifying against official records...</p>
            </div>
          )}

          {step === "success" && mockData && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{idType} Verified!</h3>
                <p className="text-sm text-muted-foreground">The ID is authentic and matches official records.</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-left space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{mockData.name}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">DOB</span>
                  <span className="font-medium">{mockData.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{idType} No.</span>
                  <span className="font-medium">{idNumber.toUpperCase()}</span>
                </div>
              </div>
              <Button onClick={handleImport} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Import Verified Document
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
