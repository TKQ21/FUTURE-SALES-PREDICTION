import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3, Upload, TrendingUp, Activity, ChevronLeft,
  ChevronRight, LayoutDashboard
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/forecast", label: "Forecast", icon: TrendingUp },
  { path: "/models", label: "Models", icon: Activity },
  { path: "/upload", label: "Upload Data", icon: Upload },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
          <BarChart3 className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-sidebar-accent-foreground tracking-tight text-sm">
              SalesCast
            </span>
          )}
        </div>

        <nav className="flex-1 py-3 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-sidebar-border text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
