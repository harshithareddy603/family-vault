import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, CheckCircle2, Clock, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { documents } = useDocuments();

  useEffect(() => { document.title = "Dashboard · Smart Docs"; }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => d.family_member_id === null);
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

      {/* Recent documents */}
      <Card className="p-4 shadow-card mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold">My documents</h2>
          <div className="flex items-center gap-2">
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
