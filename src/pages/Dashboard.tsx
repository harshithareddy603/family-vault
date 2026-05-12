import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFamily } from "@/hooks/useFamily";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Users, AlertTriangle, CheckCircle2, Clock, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { members } = useFamily();
  const { documents } = useDocuments();
  const [selectedOwner, setSelectedOwner] = useState<string>("all");

  useEffect(() => { document.title = "Dashboard · Smart Docs"; }, []);

  const stats = useMemo(() => {
    const expired = documents.filter((d) => d.status === "expired").length;
    const soon = documents.filter((d) => d.status === "soon").length;
    const safe = documents.filter((d) => d.status === "safe").length;
    return { expired, soon, safe };
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    if (selectedOwner === "all") return documents;
    if (selectedOwner === "myself") return documents.filter((d) => d.family_member_id === null);
    return documents.filter((d) => d.family_member_id === selectedOwner);
  }, [documents, selectedOwner]);

  const name = user?.user_metadata?.name;

  return (
    <AppLayout>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-2xl font-bold leading-tight">
          {name ? `Hi, ${name} 👋` : "Hi there 👋"}
        </h1>
      </div>

      {/* Stat cards: 3 cols */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard icon={FileText} label="Documents" value={documents.length} tone="primary" />
        <StatCard icon={Clock} label="Expiring" value={stats.soon} tone="warning" />
        <StatCard icon={AlertTriangle} label="Expired" value={stats.expired} tone="danger" />
      </div>

      {/* Recent documents */}
      <Card className="p-4 shadow-card mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold">Recent documents</h2>
          <div className="flex items-center gap-2">
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="myself">Myself</SelectItem>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to="/documents" className="text-xs text-primary font-medium flex items-center ml-1">
              All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        {filteredDocuments.length === 0 ? (
          <EmptyHint text="No documents yet." cta="Add document" to="/documents" />
        ) : (
          <ul className="space-y-2">
            {filteredDocuments.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {d.category}{d.expiry_date ? ` · ${d.expiry_date}` : ""}
                  </p>
                </div>
                <StatusPill status={d.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppLayout>
  );
};

const toneClasses: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

const StatCard = ({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) => (
  <Card className="p-4 shadow-card">
    <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
      <Icon className="h-4.5 w-4.5" />
    </div>
    <p className="mt-2 text-2xl font-bold font-display leading-none">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </Card>
);

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

const EmptyHint = ({ text, cta, to }: { text: string; cta: string; to: string }) => (
  <div className="text-center py-5">
    <p className="text-sm text-muted-foreground mb-3">{text}</p>
    <Link to={to}><Button size="sm">{cta}</Button></Link>
  </div>
);

export default Dashboard;
