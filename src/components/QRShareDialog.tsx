import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDocuments } from "@/hooks/useDocuments";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import type { DocumentRow } from "@/services/supabase";

interface QRShareDialogProps {
  document: DocumentRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRShareDialog = ({ document, isOpen, onClose }: QRShareDialogProps) => {
  const { getSignedUrl } = useDocuments();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isOpen && document?.file_url) {
      const fetchUrl = async () => {
        setLoading(true);
        setSignedUrl(null);
        try {
          // Ideally 86400s (24 hours), assuming getSignedUrl takes expiry.
          // For now, getSignedUrl has default behavior.
          const url = await getSignedUrl(document.file_url!, 86400); 
          if (url) {
            setSignedUrl(url);
          } else {
            toast.error("Failed to generate share link");
          }
        } catch (error) {
          toast.error("Error generating share link");
        } finally {
          setLoading(false);
        }
      };
      fetchUrl();
    }
  }, [isOpen, document, getSignedUrl]);

  const handleCopy = () => {
    if (signedUrl) {
      navigator.clipboard.writeText(signedUrl);
      toast.success("Link copied!");
    }
  };

  const handleDownload = () => {
    if (!svgRef.current || !document) return;
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${document.name}_QR.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center">Share Document</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating secure link...</p>
            </div>
          ) : signedUrl ? (
            <>
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <QRCodeSVG 
                  id="qr-code-svg" 
                  value={signedUrl} 
                  size={200} 
                  ref={svgRef}
                  level="H"
                />
              </div>
              <div className="w-full flex items-center space-x-2">
                <Input value={signedUrl} readOnly className="flex-1 text-xs" />
                <Button size="icon" variant="outline" onClick={handleCopy} title="Copy Link">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button className="w-full" variant="secondary" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download QR
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Unable to generate share link.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
