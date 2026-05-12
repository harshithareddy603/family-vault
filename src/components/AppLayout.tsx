import { Link, NavLink, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileText, Home, Users, LogOut, ShieldCheck } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/documents", label: "Docs", icon: FileText },
  { to: "/family", label: "Family", icon: Users },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

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
              <p className="font-display text-base font-bold leading-none">Zerra Docs</p>
              {user?.email && (
                <p className="text-[11px] text-muted-foreground truncate max-w-[160px] mt-0.5">{user.email}</p>
              )}
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Logout"
            onClick={async () => { await signOut(); nav("/auth"); }}
          >
            <LogOut className="h-5 w-5" />
          </Button>
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
        <div className="grid grid-cols-3 max-w-screen-sm mx-auto">
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
                    className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
                      isActive ? "bg-primary/10" : ""
                    }`}
                  >
                    <l.icon className="h-5 w-5" />
                  </span>
                  {l.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
