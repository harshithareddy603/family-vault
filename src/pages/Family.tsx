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
import { Plus, Pencil, Trash2, Users, FileText, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const RELATIONS = ["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"];

const Family = () => {
  const { members, addMember, updateMember, deleteMember } = useFamily();
  const { documents } = useDocuments();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Father");
  const [age, setAge] = useState<string>("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => { document.title = "Family · Smart Docs"; }, []);

  const reset = () => { setName(""); setRelation("Father"); setAge(""); setBloodGroup(""); setAddress(""); setEditingId(null); setTermsAccepted(false); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error("Please accept the terms to continue.");
      return;
    }
    const payload = { 
      name, 
      relation, 
      age: age ? parseInt(age, 10) : null,
    };
    const { error } = editingId
      ? await updateMember(editingId, payload)
      : await addMember(payload);
    if (error) toast.error(error.message);
    else { toast.success(editingId ? "Member updated" : "Member added"); setOpen(false); reset(); }
  };

  const startEdit = (id: string) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id); setName(m.name); setRelation(m.relation); setAge(m.age?.toString() ?? "");
    setBloodGroup(m.blood_group ?? ""); setAddress(m.address ?? "");
    setTermsAccepted(true);
    setOpen(true);
  };

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold">Family Doc's</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your loved ones.</p>
      </div>

      {members.length === 0 ? (
        <Card className="p-10 text-center shadow-card">
          <Users className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No family members yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Tap the + button to add one.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {members.map((m) => {
            const docs = documents.filter((d) => d.family_member_id === m.id);
            const alerts = docs.filter((d) => d.status !== "safe").length;
            return (
              <Card key={m.id} className="p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-hero text-primary-foreground font-semibold">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {m.relation}{m.age ? ` · ${m.age} yrs` : ""}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px]">
                      <span className="text-muted-foreground">{docs.length} docs</span>
                      {alerts > 0 && (
                        <span className="text-warning font-medium">
                          {alerts} alert{alerts > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(m.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger"
                      onClick={async () => {
                        const { error } = await deleteMember(m.id);
                        if (error) toast.error(error.message); else toast.success("Removed");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-end">
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-primary" onClick={() => setViewingId(m.id)}>
                    View Details <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </ul>
      )}

      {/* Floating action button */}
      <Button
        aria-label="Add family member"
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
            <DrawerTitle>{editingId ? "Edit member" : "Add family member"}</DrawerTitle>
            <DrawerDescription className="sr-only">
              Fill out the details below to add or edit a family member.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={submit} className="px-4 space-y-4 pb-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Relation</Label>
              <Select value={relation} onValueChange={setRelation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RELATIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>
            <div className="flex items-start gap-2 pt-2">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(!!v)} required />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-snug">
                Please try to save correct details for accessing the files easily.
              </label>
            </div>
            <DrawerFooter className="px-0">
              <Button type="submit" className="w-full bg-gradient-hero" disabled={!termsAccepted}>
                {editingId ? "Save changes" : "Add member"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* View Details Drawer */}
      <Drawer open={!!viewingId} onOpenChange={(v) => { if (!v) setViewingId(null); }}>
        <DrawerContent>
          {(() => {
            const m = members.find(x => x.id === viewingId);
            const mDocs = documents.filter(d => d.family_member_id === viewingId);
            return (
              <>
                <DrawerHeader className="text-left">
                  <DrawerTitle>{m?.name}'s Details</DrawerTitle>
                  <DrawerDescription className="sr-only">
                    Details and documents for {m?.name}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-8 max-h-[60vh] overflow-y-auto">
                  <div className="mb-4 space-y-1">
                    <p className="text-sm font-medium">Personal Info</p>
                    <p className="text-xs text-muted-foreground">Relation: {m?.relation}</p>
                    {m?.age && <p className="text-xs text-muted-foreground">Age: {m.age} years</p>}
                  </div>
                  
                  <p className="text-sm font-medium mb-3">Documents ({mDocs.length})</p>
                  {mDocs.length === 0 ? (
                    <Card className="p-6 text-center shadow-none border-dashed">
                      <p className="text-xs text-muted-foreground">No documents added yet.</p>
                    </Card>
                  ) : (
                    <ul className="space-y-2">
                      {mDocs.map(d => (
                        <Card key={d.id} className="p-3 shadow-sm flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs truncate">{d.name}</p>
                              <p className="text-[10px] text-muted-foreground">{d.category}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            );
          })()}
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
};

export default Family;
