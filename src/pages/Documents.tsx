import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  DrawerFooter,
} from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFamily } from "@/hooks/useFamily";
import { useDocumentsWithCache } from "@/hooks/useDocumentsWithCache";
import { Plus, Trash2, Download, FileText, AlertTriangle, Clock, CheckCircle2, CheckSquare, Share2, Search, FileX, Pencil, Loader2, Fingerprint, Landmark, Globe, CreditCard, HeartPulse, Building2, GraduationCap, Car } from "lucide-react";
import { toast } from "sonner";
import { DocumentPreviewSheet } from "@/components/DocumentPreviewSheet";
import { QRShareDialog } from "@/components/QRShareDialog";
import { EditDocumentDrawer } from "@/components/EditDocumentDrawer";
import { BulkActionBar } from "@/components/BulkActionBar";
import type { DocumentRow } from "@/services/supabase";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const CATEGORIES = ["ID", "Passport", "License", "Insurance", "Medical", "Education", "Property", "Other"];
const FILTER_CHIPS = ["All", ...CATEGORIES, "⚠ Expiring Soon", "❌ Expired"];

const getDocumentLogo = (name: string, category: string, source: string | null) => {
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  const s = source?.toLowerCase() || "";
  
  if (n.includes("aadhaar") || c.includes("aadhaar") || s.includes("aadhaar") || c === "id") {
    return <Fingerprint className="h-5 w-5 text-purple-600" />;
  }
  if (n.includes("pan") || c.includes("pan") || s.includes("pan")) {
    return <Landmark className="h-5 w-5 text-blue-600" />;
  }
  if (n.includes("passport") || c === "passport" || s.includes("passport")) {
    return <Globe className="h-5 w-5 text-sky-500" />;
  }
  if (n.includes("voter") || c === "voter" || s.includes("voter_id")) {
    return <CreditCard className="h-5 w-5 text-teal-600" />;
  }
  if (c === "driving license" || c === "license" || n.includes("license") || s.includes("license")) {
    return <Car className="h-5 w-5 text-amber-600" />;
  }
  
  if (c === "medical") return <HeartPulse className="h-5 w-5 text-rose-500" />;
  if (c === "property") return <Building2 className="h-5 w-5 text-indigo-500" />;
  if (c === "education") return <GraduationCap className="h-5 w-5 text-emerald-500" />;
  if (c === "insurance") return <Car className="h-5 w-5 text-amber-500" />;
  
  return <FileText className="h-5 w-5 text-blue-500" />;
};

const Documents = () => {
  const { members } = useFamily();
  const { documents, loading, addDocument, deleteDocument, getSignedUrl, isOffline, uploadProgress } = useDocumentsWithCache();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("ID");
  const [expiry, setExpiry] = useState("");
  const [owner, setOwner] = useState<string>("self");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);

  // Bulk Download States
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const [shareDoc, setShareDoc] = useState<DocumentRow | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentRow | null>(null);

  // Search, Filter, Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest_first");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "myself" | "family">("all");
  const [familyMemberFilter, setFamilyMemberFilter] = useState<string>("all");

  useEffect(() => { document.title = "Documents · Smart Docs"; }, []);

  const reset = () => {
    setName(""); setCategory("ID"); setExpiry(""); setOwner("self"); setFile(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await addDocument({
      name,
      category,
      expiry_date: expiry || null,
      family_member_id: owner === "self" ? null : owner,
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

  const handleDownloadZip = async () => {
    if (selectedIds.size === 0) return;
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();
      const selectedDocs = documents.filter(d => selectedIds.has(d.id));
      
      let successCount = 0;
      for (const doc of selectedDocs) {
        if (!doc.file_url) continue;
        const url = await getSignedUrl(doc.file_url);
        if (url) {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            const ext = doc.file_url.split('.').pop() || 'pdf';
            zip.file(`${doc.name}.${ext}`, blob);
            successCount++;
          } catch (e) {
            console.error("Failed to fetch blob for", doc.name);
          }
        }
      }

      if (successCount === 0) throw new Error("No files could be downloaded.");

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const date = new Date().toISOString().split("T")[0];
      saveAs(zipBlob, `SmartDocs_Export_${date}.zip`);
      toast.success("ZIP downloaded successfully");
      setSelectionMode(false);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Failed to download ZIP");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Compute processed documents
  const processedDocuments = documents
    .filter((d) => {
      // 1. Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const ownerName = d.family_member_id ? members.find((m) => m.id === d.family_member_id)?.name ?? "Family" : "You";
        const matchesSearch = d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || ownerName.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      // 2. Filter
      if (activeFilter !== "All") {
        if (activeFilter === "⚠ Expiring Soon") {
          return d.status === "soon";
        } else if (activeFilter === "❌ Expired") {
          return d.status === "expired";
        } else if (activeFilter === "⭐ Priority") {
          return d.priority;
        } else {
          return d.category === activeFilter;
        }
      }
      
      // 3. Owner Filter
      if (ownerFilter === "myself" && d.family_member_id !== null) return false;
      if (ownerFilter === "family") {
        if (d.family_member_id === null) return false;
        if (familyMemberFilter !== "all" && d.family_member_id !== familyMemberFilter) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // 3. Sort
      if (sortBy === "newest_first") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest_first") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "name_az") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name_za") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "expiry_soonest") {
        if (!a.expiry_date) return 1;
        if (!b.expiry_date) return -1;
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      }
      if (sortBy === "priority_first") {
        if (a.priority === b.priority) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.priority ? -1 : 1;
      }
      return 0;
    });

  return (
    <AppLayout>
      {isOffline && (
        <div className="bg-yellow-500/10 text-yellow-600 p-2 mb-4 rounded-md text-xs text-center border border-yellow-500/20">
          You are viewing cached offline data.
        </div>
      )}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your secure vault</p>
        </div>
        <div className="flex items-center gap-2">
          {uploadProgress > 0 && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-medium text-primary">{Math.round(uploadProgress)}%</span>
              <div className="w-20 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <Button 
            variant={selectionMode ? "default" : "outline"} 
            size="sm" 
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedIds(new Set());
            }}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            {selectionMode ? "Cancel" : "Select"}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <Select value={ownerFilter} onValueChange={(v: "all" | "myself" | "family") => { setOwnerFilter(v); setFamilyMemberFilter("all"); }}>
          <SelectTrigger className="w-[120px] h-8 text-xs bg-card border border-border/50 shadow-sm rounded-full">
            <SelectValue placeholder="Show" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            <SelectItem value="myself">Myself</SelectItem>
            <SelectItem value="family">Family</SelectItem>
          </SelectContent>
        </Select>

        {ownerFilter === "family" && (
          <Select value={familyMemberFilter} onValueChange={setFamilyMemberFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-card border border-border/50 shadow-sm rounded-full">
              <SelectValue placeholder="Family Member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            className="pl-9 h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest_first">Newest First</SelectItem>
            <SelectItem value="oldest_first">Oldest First</SelectItem>
            <SelectItem value="name_az">Name A-Z</SelectItem>
            <SelectItem value="name_za">Name Z-A</SelectItem>
            <SelectItem value="expiry_soonest">Expiry Soonest</SelectItem>
            <SelectItem value="priority_first">Priority First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-none">
        {FILTER_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors ${
              activeFilter === chip 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Loading documents...</p>
        </div>
      ) : documents.length === 0 && !searchQuery && activeFilter === "All" ? (
        <Card className="p-10 text-center shadow-card">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No documents yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Tap the + button to upload your first.</p>
        </Card>
      ) : processedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">No documents found</p>
        </div>
      ) : (
        <ul className="space-y-3 pb-24">
          {processedDocuments.map((d) => {
            const ownerName = d.family_member_id
              ? members.find((m) => m.id === d.family_member_id)?.name ?? "Family"
              : "You";
            const isSelected = selectedIds.has(d.id);
            return (
              <Card 
                key={d.id} 
                className={`p-4 shadow-card overflow-hidden transition-colors relative ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-secondary/20'}`}
              >
                {selectionMode && (
                  <div className="absolute top-4 left-4 z-10">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedIds);
                        if (checked) newSet.add(d.id); else newSet.delete(d.id);
                        setSelectedIds(newSet);
                      }}
                    />
                  </div>
                )}
                <div 
                  className={`flex items-start justify-between gap-3 cursor-pointer ${selectionMode ? 'pl-8' : ''}`}
                  onClick={() => {
                    if (selectionMode) {
                      const newSet = new Set(selectedIds);
                      if (isSelected) newSet.delete(d.id); else newSet.add(d.id);
                      setSelectedIds(newSet);
                    } else if (d.file_url) {
                      setPreviewDoc(d);
                    }
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/50 text-primary overflow-hidden">
                      {getDocumentLogo(d.name, d.category, d.source)}
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
                    onClick={() => setShareDoc(d)}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditDoc(d)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
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

      {selectionMode && selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={processedDocuments.length}
          onSelectAll={() => setSelectedIds(new Set(processedDocuments.map(d => d.id)))}
          onDeselectAll={() => setSelectedIds(new Set())}
          onDownload={handleDownloadZip}
          isDownloading={isDownloadingZip}
        />
      )}

      {/* Floating action button */}
      {!selectionMode && (
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
      )}

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
                  {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  {members.length === 0 && (
                    <div className="p-2 w-full">
                      <Link to="/family">
                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setOpen(false)}>
                          + Add Family Member
                        </Button>
                      </Link>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <div className="flex items-center gap-3">
                <Input type="file" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="flex-1" />
                {file && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="relative h-6 w-6 flex-shrink-0 flex items-center justify-center">
                    <svg className="animate-spin h-full w-full text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <DrawerFooter className="px-0">
              <Button type="submit" className="w-full bg-gradient-hero" disabled={busy}>
                {busy ? "Saving…" : "Save document"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <DocumentPreviewSheet 
        document={previewDoc} 
        isOpen={!!previewDoc} 
        onClose={() => setPreviewDoc(null)} 
      />

      <QRShareDialog
        document={shareDoc}
        isOpen={!!shareDoc}
        onClose={() => setShareDoc(null)}
      />

      <EditDocumentDrawer
        document={editDoc}
        isOpen={!!editDoc}
        onClose={() => setEditDoc(null)}
      />
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
