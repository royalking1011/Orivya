import AdminLayout from "@/pages/admin-layout";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Shield,
  Crown,
  Users,
  Search,
  Plus,
  Trash2,
  UserCog,
  Mail,
  Calendar,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type StaffUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

function formatDate(date?: string) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}

function roleLabel(role: string) {
  return (role || "").replaceAll("_", " ");
}

function roleBadge(role: string) {
  const r = (role || "").toLowerCase();

  if (r === "super_admin")
    return "bg-purple-500/10 text-purple-700 border-purple-500/20";
  if (r === "admin") return "bg-blue-500/10 text-blue-700 border-blue-500/20";
  if (r.includes("manager"))
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (r.includes("support"))
    return "bg-sky-500/10 text-sky-700 border-sky-500/20";
  if (r.includes("warehouse"))
    return "bg-orange-500/10 text-orange-700 border-orange-500/20";
  if (r.includes("account"))
    return "bg-rose-500/10 text-rose-700 border-rose-500/20";

  return "bg-zinc-500/10 text-zinc-700 border-zinc-500/20";
}

export default function AdminStaff() {
  const { toast } = useToast();

  const staffRoles = [
    "admin",
    "order_manager",
    "product_manager",
    "support_executive",
    "refund_manager",
    "marketing_manager",
    "accountant",
    "warehouse_manager",
  ];

  const {
    data: staff,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery<StaffUser[]>({
    queryKey: ["/api/admin/staff"],
    queryFn: async () => {
      const res = await fetch("/api/admin/staff", {
        credentials: "include",
      });

      if (res.status === 403) throw new Error("Super Admin only");
      if (!res.ok) throw new Error("Failed to fetch staff");

      return res.json();
    },
    retry: false,
  });

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = staff || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((s) =>
      `${s.id} ${s.name} ${s.email} ${s.role}`.toLowerCase().includes(q),
    );
  }, [staff, search]);

  // CREATE STAFF
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const canCreate =
    !!createForm.name.trim() &&
    !!createForm.email.trim() &&
    createForm.email.includes("@") &&
    createForm.password.length >= 6;

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/staff", {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });
    },
    onSuccess: async () => {
      toast({ title: "Staff user created" });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      setOpenCreate(false);
      setCreateForm({ name: "", email: "", password: "", role: "admin" });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to create staff",
        description: err?.message || "Check backend roles & login.",
        variant: "destructive",
      });
    },
  });

  // UPDATE ROLE
  const [openRole, setOpenRole] = useState<StaffUser | null>(null);
  const [newRole, setNewRole] = useState("admin");

  const roleMutation = useMutation({
    mutationFn: async () => {
      if (!openRole) return;
      return apiRequest("PATCH", `/api/admin/staff/${openRole.id}/role`, {
        role: newRole,
      });
    },
    onSuccess: async () => {
      toast({ title: "Role updated" });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      setOpenRole(null);
    },
    onError: () => {
      toast({
        title: "Failed to update role",
        variant: "destructive",
      });
    },
  });

  // DELETE
  const [openDelete, setOpenDelete] = useState<StaffUser | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!openDelete) return;
      return apiRequest("DELETE", `/api/admin/staff/${openDelete.id}`);
    },
    onSuccess: async () => {
      toast({ title: "Staff deleted" });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      setOpenDelete(null);
    },
    onError: () => {
      toast({
        title: "Failed to delete staff",
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout
      title="Staff"
      subtitle="Super Admin only — manage internal staff accounts"
    >
      <div className="space-y-8">
        {/* HERO */}
        <div className="rounded-3xl border bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm w-fit">
                <Crown className="h-4 w-4" />
                Orivya Eco Staff Suite
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Staff Management
              </h1>

              <p className="text-white/70 text-sm md:text-base max-w-2xl">
                Create staff users, assign roles, and control access to the admin
                panel.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button
                className="rounded-2xl"
                onClick={() => setOpenCreate(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>

              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isFetching ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-6">
            <Badge className="bg-white/10 hover:bg-white/10 text-white">
              Total Staff: {staff?.length ?? 0}
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/10 text-white">
              Showing: {filtered.length}
            </Badge>
          </div>
        </div>

        {/* ERROR */}
        {error ? (
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardContent className="p-6 space-y-2">
              <p className="font-semibold text-lg">Access denied</p>
              <p className="text-sm text-black/60">
                {String((error as any)?.message || "Super Admin only")}
              </p>
              <p className="text-xs text-black/50">
                Login with: admin@orivyaeco.com (super_admin)
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* SEARCH */}
        <Card className="rounded-3xl shadow-sm border bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Search className="h-4 w-4" />
              Search Staff
            </div>

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, role, id..."
              className="rounded-2xl"
            />
          </CardContent>
        </Card>

        {/* LIST */}
        <Card className="rounded-3xl shadow-sm border bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff List
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p className="text-sm text-black/60">Loading staff...</p>
            ) : !filtered.length ? (
              <p className="text-sm text-black/60">No staff found.</p>
            ) : (
              <div className="space-y-4">
                {filtered.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-3xl border bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      {/* LEFT */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold">{s.name}</p>

                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium capitalize ${roleBadge(
                              s.role,
                            )}`}
                          >
                            <Shield className="h-3.5 w-3.5" />
                            {roleLabel(s.role)}
                          </span>

                          <Badge variant="outline" className="rounded-full">
                            ID: {s.id}
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-1 text-sm text-black/60">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-black/40" />
                            <span className="font-medium text-black">
                              {s.email}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-black/40" />
                            <span>Created: {formatDate(s.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => {
                            setOpenRole(s);
                            setNewRole(s.role);
                          }}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Change Role
                        </Button>

                        <Button
                          variant="destructive"
                          className="rounded-2xl"
                          onClick={() => setOpenDelete(s)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* =========================
            MODALS
            ========================= */}

        {/* CREATE STAFF */}
        {openCreate ? (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl border overflow-hidden">
              <div className="p-6 border-b">
                <p className="text-lg font-semibold">Create Staff User</p>
                <p className="text-sm text-black/60">
                  Staff can access admin panel depending on role.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Full name"
                  className="rounded-2xl"
                />

                <Input
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="Email"
                  className="rounded-2xl"
                />

                <Input
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Password (min 6 chars)"
                  type="password"
                  className="rounded-2xl"
                />

                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, role: e.target.value }))
                  }
                  className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
                >
                  {staffRoles.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)}
                    </option>
                  ))}
                </select>

                <div className="rounded-2xl border bg-zinc-50 p-4 text-sm text-black/70">
                  <p className="font-medium flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" />
                    Recommended Roles
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>order_manager → manage orders</li>
                    <li>product_manager → manage products</li>
                    <li>warehouse_manager → stock & dispatch</li>
                    <li>accountant → payments & finance</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setOpenCreate(false)}
                >
                  Cancel
                </Button>

                <Button
                  className="rounded-2xl"
                  disabled={!canCreate || createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                >
                  {createMutation.isPending ? "Creating..." : "Create Staff"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* CHANGE ROLE */}
        {openRole ? (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border overflow-hidden">
              <div className="p-6 border-b">
                <p className="text-lg font-semibold">Change Role</p>
                <p className="text-sm text-black/60">
                  Updating role for:{" "}
                  <span className="font-semibold">{openRole.name}</span>
                </p>
              </div>

              <div className="p-6 space-y-4">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
                >
                  {staffRoles.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-black/50">
                  Note: Super Admin role cannot be assigned from here.
                </p>
              </div>

              <div className="p-6 border-t flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setOpenRole(null)}
                >
                  Cancel
                </Button>

                <Button
                  className="rounded-2xl"
                  disabled={roleMutation.isPending}
                  onClick={() => roleMutation.mutate()}
                >
                  {roleMutation.isPending ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* DELETE STAFF */}
        {openDelete ? (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border overflow-hidden">
              <div className="p-6 border-b">
                <p className="text-lg font-semibold">Delete Staff</p>
                <p className="text-sm text-black/60">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{openDelete.name}</span>?
                </p>
              </div>

              <div className="p-6 text-sm text-black/70 space-y-2">
                <p>⚠️ This action cannot be undone.</p>
                <p>
                  Staff ID:{" "}
                  <span className="font-semibold">#{openDelete.id}</span>
                </p>
              </div>

              <div className="p-6 border-t flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setOpenDelete(null)}
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  className="rounded-2xl"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
