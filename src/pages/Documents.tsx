import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFamily } from "@/hooks/useFamily";
import { useDocuments } from "@/hooks/useDocuments";
import { Plus, Trash2, Download, FileText, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["ID", "Passport", "License", "Insurance", "Medical", "Education", "Property", "Other"];

const Documents = () => {
  const { members } = useFamily();
  const { documents, addDocument, deleteDocument, getSignedUrl } = useDocuments();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("ID");
  const [expiry, setExpiry] = useState("");
  const [owner, setOwner] = useState<string>("self");
  const [priority, setPriority] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Documents · Smart Docs"; }, []);

  const reset = () => {
    setName(""); setCategory("ID"); setExpiry(""); setOwner("self"); setPriority(false); setFile(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await addDocument({
      name,
      category,
      expiry_date: expiry || null,
      family_member_id: owner === "self" ? null : owner,
      priority,
      file,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Document saved"); setOpen(false); reset(); }
  };

  const download = async (path: string) => {
    const url = await getSignedUrl(path);
    if (url) window.open(url, "_blank");
    else toast.error("Could not get file");
  };

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold">Documents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All your paperwork in one place.</p>
      </div>

      {documents.length === 0 ? (
        <Card className="p-10 text-center shadow-card">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No documents yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Tap the + button to upload your first.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {documents.map((d) => {
            const ownerName = d.family_member_id
              ? members.find((m) => m.id === d.family_member_id)?.name ?? "Family"
              : "You";
            return (
              <Card key={d.id} className="p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{d.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {d.category} · {ownerName}
                      </p>
                      {d.expiry_date && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">Expires {d.expiry_date}</p>
                      )}
                      {d.priority && (
                        <p className="text-[11px] text-accent font-medium mt-0.5">⭐ Priority</p>
                      )}
                    </div>
                  </div>
                  <StatusPill status={d.status} />
                </div>
                <div className="mt-3 flex gap-2">
                  {d.file_url && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => download(d.file_url!)}>
                      <Download className="h-3.5 w-3.5 mr-1" /> Open
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    onClick={async () => {
                      const { error } = await deleteDocument(d.id);
                      if (error) toast.error(error.message); else toast.success("Deleted");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </ul>
      )}

      {/* Floating action button */}
      <Button
        aria-label="Upload document"
        className="fixed bottom-20 right-4 z-30 h-14 w-14 rounded-full bg-gradient-hero shadow-soft p-0"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => {
          e.currentTarget.blur();
          setOpen(true);
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Drawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Add document</DrawerTitle>
            <DrawerDescription className="sr-only">
              Fill out the details to add a new document to your vault.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={submit} className="px-4 space-y-4 pb-2">
            <div className="space-y-2">
              <Label>Document name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Belongs to</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Myself</SelectItem>
                  {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} ({m.relation})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File (optional)</Label>
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={priority} onCheckedChange={(v) => setPriority(!!v)} />
              Mark as priority
            </label>
            <DrawerFooter className="px-0">
              <Button type="submit" className="w-full bg-gradient-hero" disabled={busy}>
                {busy ? "Saving…" : "Save document"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
};

const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, { cls: string; icon: any; label: string }> = {
    expired: { cls: "bg-danger/10 text-danger", icon: AlertTriangle, label: "Expired" },
    soon: { cls: "bg-warning/10 text-warning", icon: Clock, label: "Soon" },
    safe: { cls: "bg-success/10 text-success", icon: CheckCircle2, label: "Safe" },
  };
  const m = map[status] ?? map.safe;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium shrink-0 ${m.cls}`}>
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
};

export default Documents;
