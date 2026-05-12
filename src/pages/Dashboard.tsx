import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DocumentPreviewSheet } from "@/components/DocumentPreviewSheet";
import type { DocumentRow } from "@/services/supabase";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Clock, ChevronRight, FileText, HeartPulse, Building2, GraduationCap, Car, Fingerprint, Landmark, Globe, CreditCard, Loader2 } from "lucide-react";
import { DocumentLogo } from "@/components/DocumentLogo";

const Dashboard = () => {
  const { user } = useAuth();
  const { documents, loading } = useDocuments();
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);

  useEffect(() => { document.title = "Dashboard · Smart Docs"; }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => d.family_member_id === null);
  }, [documents]);

  const name = user?.user_metadata?.name || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

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
      {/* Blue Header Section */}
      <div className="bg-[#4a3aff] text-white rounded-2xl p-5 mb-6 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold font-display">Welcome, {name}!</h1>
          </div>
          <Avatar className="h-12 w-12 border-2 border-white/20">
            {avatarUrl ? <AvatarImage src={avatarUrl} className="object-cover object-[center_20%]" /> : <AvatarFallback className="bg-primary-foreground text-primary">{name.charAt(0)}</AvatarFallback>}
          </Avatar>
        </div>
        <p className="text-sm text-white/90 mb-4 leading-snug">
          Smart Doc's stores the files as per the user uploades.
        </p>
      </div>

      {/* Document List */}
      <Card className="p-4 shadow-card mb-5 border-none bg-transparent shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold">My documents</h2>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <EmptyHint text="No documents yet." cta="Add document" to="/documents" />
        ) : (
          <ul className="space-y-2">
            {filteredDocuments.slice(0, 5).map((d) => (
              <li 
                key={d.id} 
                onClick={() => setPreviewDoc(d)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card shadow-sm border border-border/50 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white rounded-xl overflow-hidden p-1 shadow-sm border border-border/20">
                  <DocumentLogo name={d.name} category={d.category} source={d.source} className="h-8 w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate text-foreground">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate uppercase tracking-wider font-medium">
                    {d.category}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <DocumentPreviewSheet 
        document={previewDoc} 
        isOpen={!!previewDoc} 
        onClose={() => setPreviewDoc(null)} 
      />
    </AppLayout>
  );
};

const EmptyHint = ({ text, cta, to }: { text: string; cta: string; to: string }) => (
  <div className="text-center py-5">
    <p className="text-sm text-muted-foreground mb-3">{text}</p>
    <Link to={to}><Button size="sm">{cta}</Button></Link>
  </div>
);

export default Dashboard;
