import AdminLayout from "@/pages/admin-layout";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";

import {
  Users,
  Search,
  Crown,
  Sparkles,
  Mail,
  Calendar,
  Wallet,
  Shield,
  UserCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type MeUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Customer = {
  id: number;
  name: string;
  email: string;
  role: string;
  walletBalance: string;
  createdAt: string;
};

function formatDate(date?: string) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}

function roleStyle(role: string) {
  const r = (role || "").toLowerCase();

  if (r === "super_admin")
    return "bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/20";
  if (r === "admin")
    return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
  if (r === "customer")
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";

  return "bg-zinc-500/10 text-zinc-700 border-zinc-500/20";
}

export default function AdminCustomers() {
  // =========================
  // AUTH CHECK
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

  const isAdmin = !!me && me.role !== "customer";

  // =========================
  // DATA
  // =========================
  const { data: customers, isLoading, refetch, isFetching } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/customers", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    },
    enabled: isAdmin,
    retry: false,
  });

  // =========================
  // UI STATE
  // =========================
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "customer" | "admin" | "super_admin"
  >("all");

  const list = customers ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return list.filter((c) => {
      const matchesSearch =
        !q ||
        `${c.id} ${c.name} ${c.email} ${c.role}`
          .toLowerCase()
          .includes(q);

      const matchesRole = roleFilter === "all" ? true : c.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [list, search, roleFilter]);

  // =========================
  // STATS
  // =========================
  const totalUsers = list.length;
  const totalCustomers = list.filter((x) => x.role === "customer").length;
  const totalAdmins = list.filter((x) => x.role !== "customer").length;

  const totalWallet = list.reduce((sum, u) => {
    return sum + Number(u.walletBalance || 0);
  }, 0);

  // =========================
  // GUARD
  // =========================
  if (meLoading) return null;
  if (!isAdmin) return <Redirect to="/auth" />;

  return (
    <AdminLayout
      title="Customers"
      subtitle="Manage your users, view balances, and track registrations"
    >
      <div className="space-y-8">
        {/* HERO */}
        <div className="rounded-3xl border bg-gradient-to-br from-emerald-700 via-teal-700 to-sky-700 text-white p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm w-fit">
                <Crown className="h-4 w-4" />
                Orivya Eco Customers Suite
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Customers & Users
              </h1>

              <p className="text-white/80 text-sm md:text-base max-w-2xl">
                View all registered users, filter by roles, search instantly, and
                track wallet balances.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-xs text-white/70">Logged in as</p>
                <p className="font-semibold">{me.name}</p>
              </div>

              <div className="rounded-2xl bg-white/15 p-4">
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
              disabled={isFetching}
              onClick={() => refetch()}
            >
              {isFetching ? "Refreshing..." : "Refresh List"}
            </Button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {totalUsers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All registered accounts
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Customers
              </CardTitle>
              <UserCheck className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Customers only
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Admin / Staff
              </CardTitle>
              <Shield className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {totalAdmins}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Admin & staff accounts
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Total Wallet
              </CardTitle>
              <Wallet className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                ₹{totalWallet.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total wallet balance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SEARCH + FILTER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="rounded-3xl shadow-sm border bg-white lg:col-span-2">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Search className="h-4 w-4" />
                Search Users
              </div>

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name, email, role..."
                className="rounded-2xl"
              />

              <p className="text-xs text-black/50">
                Tip: Search “admin”, “customer”, or by email.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border bg-white">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                Role Filter
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
              >
                <option value="all">All</option>
                <option value="customer">Customers</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>

              <p className="text-xs text-black/50">
                Filter users by role instantly.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* USERS TABLE */}
        <Card className="rounded-3xl border bg-white shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users List
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-sm text-black/60">Loading users...</div>
            ) : !filtered.length ? (
              <div className="p-6 text-sm text-black/60">
                No users found.
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b">
                    <tr className="text-left">
                      <th className="p-4 font-semibold">ID</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Wallet</th>
                      <th className="p-4 font-semibold">Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b hover:bg-zinc-50 transition"
                      >
                        <td className="p-4 font-medium">#{u.id}</td>

                        <td className="p-4">
                          <div className="font-semibold">{u.name}</div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 text-black/70">
                            <Mail className="h-4 w-4 text-black/40" />
                            {u.email}
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium capitalize ${roleStyle(
                              u.role,
                            )}`}
                          >
                            <Shield className="h-3.5 w-3.5" />
                            {u.role.replaceAll("_", " ")}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-black/40" />
                            <span className="font-semibold">
                              ₹{Number(u.walletBalance || 0).toFixed(2)}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 text-black/60">
                            <Calendar className="h-4 w-4 text-black/40" />
                            {formatDate(u.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NOTE */}
        <Card className="rounded-3xl border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Next Upgrade (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-black/70 space-y-2">
            <p>Next we can add:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Export customers CSV</li>
              <li>Ban / disable user system</li>
              <li>Customer order history on click</li>
              <li>Wallet top-up + wallet transactions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
