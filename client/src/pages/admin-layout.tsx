import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Warehouse,
  BarChart3,
  Printer,
  Shield,
  Menu,
  X,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";

export default function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = !!user && user.role !== "customer";

  const menu = useMemo(
    () => [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Warehouse", href: "/admin/warehouse", icon: Warehouse },
      { name: "Print Center", href: "/admin/print", icon: Printer },
      { name: "Staff", href: "/admin/staff", icon: Shield },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
    [],
  );

  // ✅ SAFE REDIRECT (NO LOOP)
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation("/auth");
    }
  }, [isLoading, isAdmin, setLocation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
        <div className="rounded-3xl border bg-white p-8 shadow-sm text-center space-y-2">
          <p className="text-xl font-semibold">Loading Admin Panel...</p>
          <p className="text-sm text-black/60">
            Checking your session and permissions
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        "w-72 flex-col border-r text-white",
        "bg-gradient-to-b from-black via-zinc-950 to-zinc-900",
        mobile ? "flex" : "hidden md:flex",
      )}
    >
      <div className="p-6">
        <div className="text-2xl font-serif font-bold tracking-tight">
          ORIVYA ADMIN
        </div>
        <p className="text-xs text-white/60 mt-1">Premium Store Management</p>
      </div>

      {/* ✅ VIEW STORE BUTTON */}
      <div className="px-4 pb-3">
        <Button
          className="w-full rounded-2xl bg-white text-black hover:bg-white/90"
          onClick={() => setLocation("/")}
        >
          <Store className="h-4 w-4 mr-2" />
          View Store
        </Button>
      </div>

      <div className="px-4 flex-1 space-y-2">
        {menu.map((m) => {
          const active = location === m.href;
          const Icon = m.icon;

          return (
            <Link key={m.href} href={m.href}>
              <a
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                  active
                    ? "bg-white text-black font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {m.name}
              </a>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="rounded-2xl bg-white/10 px-4 py-3">
          <p className="text-xs text-white/60">Logged in as</p>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-xs text-white/60 capitalize">
            {user?.role?.replaceAll("_", " ")}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          onClick={async () => {
            await logout();
            setLocation("/auth");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-50">
              <Sidebar mobile />
            </div>
          </div>
        )}

        {/* MAIN */}
        <main className="flex-1">
          {/* TOPBAR */}
          <div className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    className="md:hidden rounded-xl border bg-white p-2"
                    onClick={() => setMobileOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </button>

                  <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                      {title || "Admin"}
                    </h1>
                    {subtitle ? (
                      <p className="text-sm text-black/60">{subtitle}</p>
                    ) : null}
                  </div>
                </div>

                {/* ✅ TOPBAR RIGHT BUTTONS */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => setLocation("/")}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    View Store
                  </Button>

                  <div className="hidden sm:flex items-center gap-2 text-sm text-black/60">
                    <span className="font-medium text-black">{user?.name}</span>
                    <span>•</span>
                    <span className="capitalize">
                      {user?.role?.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                {mobileOpen && (
                  <button
                    className="md:hidden rounded-xl border bg-white p-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
