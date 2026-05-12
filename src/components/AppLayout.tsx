import { Link, NavLink, useNavigate } from "react-router-dom";
import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { FileText, Home, Users, LogOut, ShieldCheck, User, Bell } from "lucide-react";
import { NotificationsSheet } from "@/components/NotificationsSheet";

const links = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/documents", label: "Docs", icon: FileText },
  { to: "/family", label: "Family", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const { documents } = useDocuments();
  const nav = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsCount = documents.filter((d) => d.status === "expired" || d.status === "soon").length;

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      {/* Compact mobile top bar */}
      <header className="border-b border-border bg-card/90 backdrop-blur sticky top-0 z-30">
        <div className="px-4 flex h-14 items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-hero shadow-soft">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base font-bold leading-none">Smart Docs</p>
              {user?.email && (
                <p className="text-[11px] text-muted-foreground truncate max-w-[160px] mt-0.5">{user.email}</p>
              )}
            </div>
          </Link>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger border-2 border-card" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Logout"
              onClick={async () => { await signOut(); nav("/auth"); }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content (with bottom padding so nav doesn't cover it) */}
      <main className="flex-1 px-4 py-5 pb-24 max-w-screen-sm w-full mx-auto">
        {children}
      </main>

      {/* Bottom tab navigation */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4 max-w-screen-sm mx-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`relative grid h-9 w-9 place-items-center rounded-xl transition-colors ${
                      isActive ? "bg-primary/10" : ""
                    }`}
                  >
                    <l.icon className="h-5 w-5" />
                    {l.label === "Docs" && notificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-danger text-[8px] font-bold text-white border-2 border-card">
                        {notificationsCount > 9 ? '9+' : notificationsCount}
                      </span>
                    )}
                  </span>
                  {l.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <NotificationsSheet 
        documents={documents}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};
