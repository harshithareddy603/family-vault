import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFamily } from "@/hooks/useFamily";
import { useDocuments } from "@/hooks/useDocuments";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
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

  useEffect(() => { document.title = "Family · Zerra Docs"; }, []);

  const reset = () => { setName(""); setRelation("Father"); setAge(""); setEditingId(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, relation, age: age ? parseInt(age, 10) : null };
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
    setOpen(true);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Family</h1>
          <p className="text-muted-foreground mt-1">Manage your loved ones and their documents.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero shadow-soft"><Plus className="h-4 w-4 mr-1" /> Add member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit member" : "Add family member"}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
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
                <Input type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">{editingId ? "Save" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {members.length === 0 ? (
        <Card className="p-12 text-center shadow-card">
          <Users className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No family members yet.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const docs = documents.filter((d) => d.family_member_id === m.id);
            const alerts = docs.filter((d) => d.status !== "safe").length;
            return (
              <Card key={m.id} className="p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero text-primary-foreground font-semibold">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.relation}{m.age ? ` · ${m.age}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(m.id)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={async () => {
                      const { error } = await deleteMember(m.id);
                      if (error) toast.error(error.message); else toast.success("Removed");
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{docs.length} documents</span>
                  {alerts > 0 && <span className="text-warning font-medium">{alerts} alert{alerts > 1 ? "s" : ""}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Family;
