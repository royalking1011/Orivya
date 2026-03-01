import AdminLayout from "@/pages/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";

import {
  TrendingUp,
  ShoppingBag,
  Users,
  Crown,
  Sparkles,
  BarChart3,
  Package,
  Clock,
  Truck,
  BadgeCheck,
  PackageCheck,
  ShoppingBag as DeliveredIcon,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

type MeUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Order = {
  id: number;
  status: string;
  trackingNumber?: string | null;
  totalAmount: string;
  paymentStatus?: string | null;
  createdAt?: string;
};

type MonthlySalesRow = {
  name: string;
  total: number;
};

type WeeklyOrdersRow = {
  name: string;
  orders: number;
};

type Analytics = {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  monthlySales: MonthlySalesRow[];
  weeklyOrders: WeeklyOrdersRow[];
};

function formatDate(date?: string) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}

function statusStyle(status: string) {
  const s = (status || "").toLowerCase();

  if (s === "pending")
    return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  if (s === "confirmed")
    return "bg-blue-500/10 text-blue-700 border-blue-500/20";
  if (s === "packed")
    return "bg-purple-500/10 text-purple-700 border-purple-500/20";
  if (s === "shipped")
    return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
  if (s === "delivered")
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (s === "cancelled")
    return "bg-rose-500/10 text-rose-700 border-rose-500/20";

  return "bg-zinc-500/10 text-zinc-700 border-zinc-500/20";
}

function statusIcon(status: string) {
  const s = (status || "").toLowerCase();

  if (s === "pending") return Clock;
  if (s === "confirmed") return BadgeCheck;
  if (s === "packed") return PackageCheck;
  if (s === "shipped") return Truck;
  if (s === "delivered") return DeliveredIcon;
  if (s === "cancelled") return XCircle;

  return Clock;
}

export default function AdminDashboard() {
  // =========================
  // 1) CHECK SESSION
  // =========================
  const { data: me, isLoading: meLoading } = useQuery<MeUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Not logged in");
      return res.json();
    },
    retry: false,
  });

  // ✅ FIX: any role except customer is admin/staff
  const isAdmin = !!me && me.role !== "customer";

  // =========================
  // 2) REAL ANALYTICS
  // =========================
  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
    isFetching: analyticsFetching,
  } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: isAdmin,
    retry: false,
  });

  // =========================
  // 3) REAL RECENT ORDERS
  // =========================
  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isFetching: ordersFetching,
  } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: isAdmin,
    retry: false,
  });

  if (meLoading) return null;
  if (!isAdmin) return <Redirect to="/auth" />;

  const totalSales = Number(analytics?.totalSales ?? 0);
  const totalOrders = Number(analytics?.totalOrders ?? 0);
  const totalCustomers = Number(analytics?.totalCustomers ?? 0);

  const monthlySales = (analytics?.monthlySales ?? []).map((m) => ({
    name: m.name,
    total: Number(m.total || 0),
  }));

  const weeklyOrders = (analytics?.weeklyOrders ?? []).map((w) => ({
    name: w.name,
    orders: Number(w.orders || 0),
  }));

  const recentOrders = (orders ?? [])
    .slice()
    .sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da;
    })
    .slice(0, 6);

  const refreshing = analyticsFetching || ordersFetching;

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Your premium admin control center"
    >
      <div className="space-y-8">
        {/* HERO */}
        <div className="rounded-3xl border bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm w-fit">
                <Crown className="h-4 w-4" />
                Orivya Eco Admin Suite
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Welcome, {me?.name}
              </h1>

              <p className="text-white/70 text-sm md:text-base max-w-2xl">
                Track store performance, orders, customers, and trends — powered
                by your real database.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/70">Role</p>
                <p className="font-semibold capitalize">{me?.role}</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/70">System</p>
                <p className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Live
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              variant="secondary"
              className="rounded-2xl"
              disabled={refreshing}
              onClick={() => {
                refetchAnalytics();
                refetchOrders();
              }}
            >
              {refreshing ? "Refreshing..." : "Refresh Dashboard"}
            </Button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                ₹{totalSales.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real data from orders table
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Orders
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {totalOrders}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total orders placed
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Customers
              </CardTitle>
              <Users className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Sales */}
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Sales (Last 12 Months)
              </CardTitle>
              <CardDescription>Real database chart</CardDescription>
            </CardHeader>

            <CardContent className="pl-2">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySales}>
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="total" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {!monthlySales.length ? (
                <p className="text-sm text-black/50 pt-3">
                  No monthly sales data yet.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Weekly Orders */}
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Weekly Orders (Last 7 Days)
              </CardTitle>
              <CardDescription>Real database chart</CardDescription>
            </CardHeader>

            <CardContent className="pl-2">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {!weeklyOrders.length ? (
                <p className="text-sm text-black/50 pt-3">
                  No weekly order trend yet.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* RECENT ORDERS */}
        <Card className="rounded-3xl border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest orders from your real database
            </CardDescription>
          </CardHeader>

          <CardContent>
            {ordersLoading ? (
              <p className="text-sm text-black/60">Loading orders...</p>
            ) : !recentOrders.length ? (
              <p className="text-sm text-black/60">No orders found yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => {
                  const Icon = statusIcon(o.status);

                  return (
                    <div
                      key={o.id}
                      className="rounded-3xl border bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold">
                              Order #{o.id}
                            </p>

                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyle(
                                o.status,
                              )}`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {o.status}
                            </span>

                            <Badge variant="outline" className="rounded-full">
                              Payment: {o.paymentStatus || "pending"}
                            </Badge>
                          </div>

                          <p className="text-sm text-black/60">
                            Total:{" "}
                            <span className="font-semibold text-black">
                              ₹{Number(o.totalAmount).toFixed(2)}
                            </span>
                          </p>

                          <p className="text-xs text-black/40">
                            Created: {formatDate(o.createdAt)}
                          </p>
                        </div>

                        <div className="text-sm text-black/60">
                          Tracking:{" "}
                          <span className="font-medium text-black">
                            {o.trackingNumber || "Not added"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* LOADING NOTE */}
        {(analyticsLoading || ordersLoading) && (
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardContent className="p-6 text-sm text-black/60">
              Loading dashboard...
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
