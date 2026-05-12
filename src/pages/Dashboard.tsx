import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, CheckCircle2, Clock, ChevronRight, HardDrive } from "lucide-react";
import { DocumentStats } from "@/components/DocumentStats";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const { documents } = useDocuments();

  useEffect(() => { document.title = "Dashboard · Smart Docs"; }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => d.family_member_id === null);
  }, [documents]);

  const name = user?.user_metadata?.name;

  const { expiringSoonCount, statusData } = useMemo(() => {
    let expiringSoonCount = 0;
    let safeCount = 0;
    let soonCount = 0;
    let expiredCount = 0;

    const now = new Date();
    documents.forEach((d) => {
      if (d.status === "safe") safeCount++;
      else if (d.status === "soon") soonCount++;
      else if (d.status === "expired") expiredCount++;

      if (d.expiry_date && d.status === "soon") {
        const exp = new Date(d.expiry_date);
        const days = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days >= 0 && days <= 7) {
          expiringSoonCount++;
        }
      }
    });

    return {
      expiringSoonCount,
      statusData: [
        { name: "Safe", value: safeCount, color: "#22c55e" },
        { name: "Expiring", value: soonCount, color: "#f59e0b" },
        { name: "Expired", value: expiredCount, color: "#ef4444" },
      ].filter(item => item.value > 0),
    };
  }, [documents]);

  return (
    <AppLayout>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-2xl font-bold leading-tight">
          {name ? `Hi, ${name} 👋` : "Hi there 👋"}
        </h1>
      </div>

      {expiringSoonCount > 0 && (
        <Alert variant="destructive" className="mb-6 bg-destructive/10 text-destructive border-none">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Documents Expiring Soon</AlertTitle>
          <AlertDescription className="mt-1 flex items-center justify-between">
            <span>{expiringSoonCount} document(s) expire in the next 7 days.</span>
            <Link to="/documents" className="font-medium hover:underline">View Documents →</Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
            <HardDrive className="h-10 w-10 text-primary mb-4" />
            <p className="text-3xl font-display font-bold">{documents.length}</p>
            <p className="text-sm text-muted-foreground">files stored</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 h-[200px] flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No documents to chart</p>
            )}
          </CardContent>
        </Card>
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

      <DocumentStats />
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
