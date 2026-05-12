import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useDocuments } from "@/hooks/useDocuments";
import { Loader2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { DocumentRow } from "@/services/supabase";

interface DocumentPreviewSheetProps {
  document: DocumentRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreviewSheet = ({ document, isOpen, onClose }: DocumentPreviewSheetProps) => {
  const { getSignedUrl } = useDocuments();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && document?.file_url) {
      const fetchUrl = async () => {
        setLoading(true);
        setSignedUrl(null);
        try {
          // getSignedUrl uses 3600 seconds by default or similar.
          // Note: The useDocuments hook already implements getSignedUrl.
          const url = await getSignedUrl(document.file_url!);
          if (url) {
            setSignedUrl(url);
          } else {
            toast.error("Failed to load preview");
          }
        } catch (error) {
          toast.error("Error loading preview");
        } finally {
          setLoading(false);
        }
      };
      fetchUrl();
    }
  }, [isOpen, document, getSignedUrl]);

  if (!document) return null;

  const ext = document.file_url?.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  const isPdf = ext === "pdf";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col items-center justify-center bg-background border-t rounded-t-xl">
        <SheetHeader className="sr-only">
          <SheetTitle>Document Preview</SheetTitle>
          <SheetDescription>Preview of your uploaded document.</SheetDescription>
        </SheetHeader>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 rounded-full bg-background/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading preview...</p>
          </div>
        ) : signedUrl ? (
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-4 pt-16">
            {isPdf ? (
              <iframe src={signedUrl} className="w-full h-full rounded-md border" />
            ) : isImage ? (
              <img src={signedUrl} alt={document.name} className="max-w-full max-h-full object-contain rounded-md" />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-muted-foreground">{ext?.toUpperCase() || "?"}</span>
                </div>
                <p className="font-medium text-lg">Preview not available</p>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  This file type cannot be previewed directly in the browser. You can download it to view it locally.
                </p>
                <Button onClick={() => window.open(signedUrl, "_blank")}>
                  <Download className="mr-2 h-4 w-4" /> Download File
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-muted-foreground">Failed to load preview URL.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
