import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFamily } from "@/hooks/useFamily";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Users, AlertTriangle, CheckCircle2, Clock, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { members } = useFamily();
  const { documents } = useDocuments();

  useEffect(() => { document.title = "Dashboard · Smart Docs"; }, []);

  const stats = useMemo(() => {
    const expired = documents.filter((d) => d.status === "expired").length;
    const soon = documents.filter((d) => d.status === "soon").length;
    const safe = documents.filter((d) => d.status === "safe").length;
    return { expired, soon, safe };
  }, [documents]);

  const name = user?.user_metadata?.name;

  return (
    <AppLayout>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-2xl font-bold leading-tight">
          {name ? `Hi, ${name} 👋` : "Hi there 👋"}
        </h1>
      </div>

      {/* Stat cards: 2x2 grid on mobile */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={FileText} label="Documents" value={documents.length} tone="primary" />
        <StatCard icon={Users} label="Family" value={members.length} tone="accent" />
        <StatCard icon={Clock} label="Expiring" value={stats.soon} tone="warning" />
        <StatCard icon={AlertTriangle} label="Expired" value={stats.expired} tone="danger" />
      </div>

      {/* Recent documents */}
      <Card className="p-4 shadow-card mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold">Recent documents</h2>
          <Link to="/documents" className="text-xs text-primary font-medium flex items-center">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {documents.length === 0 ? (
          <EmptyHint text="No documents yet." cta="Add document" to="/documents" />
        ) : (
          <ul className="space-y-2">
            {documents.slice(0, 4).map((d) => (
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

      {/* Family members */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold">Family</h2>
          <Link to="/family" className="text-xs text-primary font-medium flex items-center">
            Manage <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {members.length === 0 ? (
          <EmptyHint text="No family members yet." cta="Add member" to="/family" />
        ) : (
          <ul className="space-y-2">
            {members.slice(0, 4).map((m) => {
              const count = documents.filter((d) => d.family_member_id === m.id).length;
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-hero text-primary-foreground text-sm font-semibold">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {m.relation}{m.age ? ` · ${m.age} yrs` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{count} docs</span>
                </li>
              );
            })}
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
