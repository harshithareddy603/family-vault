import { Button } from "@/components/ui/button";
import { Download, CheckSquare, XSquare, Loader2 } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export const BulkActionBar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDownload,
  isDownloading,
}: BulkActionBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 p-4 bg-card border shadow-card rounded-2xl flex items-center justify-between" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm">{selectedCount} selected</span>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}>
          {selectedCount === totalCount ? (
            <><XSquare className="h-3.5 w-3.5 mr-1" /> Deselect All</>
          ) : (
            <><CheckSquare className="h-3.5 w-3.5 mr-1" /> Select All</>
          )}
        </Button>
      </div>
      <Button size="sm" onClick={onDownload} disabled={isDownloading}>
        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
        Download ZIP
      </Button>
    </div>
  );
};
