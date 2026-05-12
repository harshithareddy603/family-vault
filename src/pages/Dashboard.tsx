import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFamily } from "@/hooks/useFamily";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Users, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { members } = useFamily();
  const { documents } = useDocuments();

  useEffect(() => { document.title = "Dashboard · Zerra Docs"; }, []);

  const stats = useMemo(() => {
    const expired = documents.filter((d) => d.status === "expired").length;
    const soon = documents.filter((d) => d.status === "soon").length;
    const safe = documents.filter((d) => d.status === "safe").length;
    return { expired, soon, safe };
  }, [documents]);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ""} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's a snapshot of your documents and family.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Documents" value={documents.length} tone="primary" />
        <StatCard icon={Users} label="Family" value={members.length} tone="accent" />
        <StatCard icon={Clock} label="Expiring soon" value={stats.soon} tone="warning" />
        <StatCard icon={AlertTriangle} label="Expired" value={stats.expired} tone="danger" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Recent documents</h2>
            <Link to="/documents"><Button variant="ghost" size="sm">View all</Button></Link>
          </div>
          {documents.length === 0 ? (
            <EmptyHint text="No documents yet." cta="Add document" to="/documents" />
          ) : (
            <ul className="space-y-3">
              {documents.slice(0, 5).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/40">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.category}{d.expiry_date ? ` · expires ${d.expiry_date}` : ""}</p>
                  </div>
                  <StatusPill status={d.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Family members</h2>
            <Link to="/family"><Button variant="ghost" size="sm">Manage</Button></Link>
          </div>
          {members.length === 0 ? (
            <EmptyHint text="No family members yet." cta="Add member" to="/family" />
          ) : (
            <ul className="space-y-3">
              {members.slice(0, 5).map((m) => {
                const count = documents.filter((d) => d.family_member_id === m.id).length;
                return (
                  <li key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/40">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.relation}{m.age ? ` · ${m.age} yrs` : ""}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{count} docs</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
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
  <Card className="p-5 shadow-card">
    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="mt-3 text-2xl font-bold font-display">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
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
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${m.cls}`}>
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
};

const EmptyHint = ({ text, cta, to }: { text: string; cta: string; to: string }) => (
  <div className="text-center py-6">
    <p className="text-sm text-muted-foreground mb-3">{text}</p>
    <Link to={to}><Button size="sm">{cta}</Button></Link>
  </div>
);

export default Dashboard;
