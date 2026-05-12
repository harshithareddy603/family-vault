import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Database } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

interface NotificationsSheetProps {
  documents: DocumentRow[];
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsSheet = ({ documents, isOpen, onClose }: NotificationsSheetProps) => {
  const now = new Date();
  
  const notifications = documents
    .filter((d) => d.status === "expired" || d.status === "soon")
    .map((d) => {
      let daysLeft = 0;
      if (d.expiry_date) {
        const exp = new Date(d.expiry_date);
        daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { ...d, daysLeft };
    })
    .sort((a, b) => {
      if (a.status === "expired" && b.status !== "expired") return -1;
      if (b.status === "expired" && a.status !== "expired") return 1;
      return a.daysLeft - b.daysLeft;
    });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[85vw] sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No expiring documents 🎉</p>
            </div>
          ) : (
            notifications.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{d.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">{d.category}</Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {d.expiry_date}
                    </span>
                  </div>
                </div>
                {d.status === "expired" ? (
                  <Badge variant="destructive" className="shrink-0 text-[10px] h-5 px-1.5 bg-danger">EXPIRED</Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0 text-[10px] h-5 px-1.5 bg-warning text-warning-foreground border-warning">
                    {d.daysLeft} days left
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
