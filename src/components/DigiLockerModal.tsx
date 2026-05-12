import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDocuments } from "@/hooks/useDocuments";
import { Loader2, CloudDownload } from "lucide-react";
import { toast } from "sonner";

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_DOCS = [
  { id: "dl1", name: "Driving License", category: "License" },
  { id: "dl2", name: "Aadhaar Card", category: "ID" },
  { id: "dl3", name: "PAN Card", category: "ID" },
  { id: "dl4", name: "Vehicle Registration", category: "Property" },
];

export const DigiLockerModal = ({ isOpen, onClose }: DigiLockerModalProps) => {
  const { addDocument } = useDocuments();
  const [step, setStep] = useState<"login" | "loading" | "select">("login");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const handleLogin = () => {
    setStep("loading");
    setTimeout(() => {
      setStep("select");
    }, 1500);
  };

  const handleImport = async () => {
    if (selectedDocs.size === 0) return;
    setImporting(true);
    let successCount = 0;

    for (const docId of selectedDocs) {
      const doc = MOCK_DOCS.find(d => d.id === docId);
      if (doc) {
        // Mock import by calling addDocument
        const { error } = await addDocument({
          name: doc.name,
          category: doc.category,
          family_member_id: null,
          priority: false,
          source: "digilocker",
        });
        if (!error) successCount++;
      }
    }

    setImporting(false);
    toast.success(`Successfully imported ${successCount} document(s) from DigiLocker`);
    setStep("login");
    setSelectedDocs(new Set());
    onClose();
  };

  const toggleDoc = (id: string) => {
    const newSet = new Set(selectedDocs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDocs(newSet);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudDownload className="h-5 w-5 text-blue-600" />
            DigiLocker Integration
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {step === "login" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your DigiLocker account to securely import your verified documents.
              </p>
              <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                Login to DigiLocker
              </Button>
            </div>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Connecting to DigiLocker...</p>
            </div>
          )}

          {step === "select" && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Select documents to import:</p>
              <div className="space-y-2 border rounded-md p-2 max-h-64 overflow-y-auto">
                {MOCK_DOCS.map((doc) => (
                  <label key={doc.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                    <Checkbox
                      checked={selectedDocs.has(doc.id)}
                      onCheckedChange={() => toggleDoc(doc.id)}
                    />
                    <div className="space-y-1 leading-none">
                      <p className="text-sm font-medium leading-none">{doc.name}</p>
                      <p className="text-[11px] text-muted-foreground">{doc.category}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button 
                onClick={handleImport} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={selectedDocs.size === 0 || importing}
              >
                {importing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                ) : (
                  `Import ${selectedDocs.size} Document(s)`
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
