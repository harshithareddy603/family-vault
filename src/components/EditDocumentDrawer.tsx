import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useFamily } from "@/hooks/useFamily";
import { useDocuments } from "@/hooks/useDocuments";
import { toast } from "sonner";
import type { DocumentRow } from "@/services/supabase";

const CATEGORIES = ["ID", "Passport", "License", "Insurance", "Medical", "Education", "Property", "Other"];

interface EditDocumentDrawerProps {
  document: DocumentRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditDocumentDrawer = ({ document, isOpen, onClose }: EditDocumentDrawerProps) => {
  const { members } = useFamily();
  const { updateDocument } = useDocuments();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("ID");
  const [expiry, setExpiry] = useState("");
  const [owner, setOwner] = useState<string>("self");
  const [priority, setPriority] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (document && isOpen) {
      setName(document.name);
      setCategory(document.category);
      setExpiry(document.expiry_date || "");
      setOwner(document.family_member_id || "self");
      setPriority(document.priority);
    }
  }, [document, isOpen]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;
    setBusy(true);
    const { error } = await updateDocument(document.id, {
      name,
      category,
      expiry_date: expiry || null,
      family_member_id: owner === "self" ? null : owner,
      priority,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Document updated successfully");
      onClose();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Document</DrawerTitle>
          <DrawerDescription className="sr-only">
            Update the details of this document.
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
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={priority} onCheckedChange={(v) => setPriority(!!v)} />
            Mark as priority
          </label>
          <DrawerFooter className="px-0">
            <Button type="submit" className="w-full bg-gradient-hero" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
