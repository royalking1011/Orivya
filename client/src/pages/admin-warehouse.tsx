import AdminLayout from "@/pages/admin-layout";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Redirect } from "wouter";
import {
  Boxes,
  Package,
  AlertTriangle,
  Search,
  Sparkles,
  Crown,
  Pencil,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type MeUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Product = {
  id: number;
  name: string;
  stock: number;
  price: string;
  sku?: string | null;
};

export default function AdminWarehouse() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  // ✅ check admin session
  const { data: me, isLoading: meLoading } = useQuery<MeUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Not logged in");
      return res.json();
    },
    retry: false,
  });

  const isAdmin = !!me && (me.role === "admin" || me.role === "super_admin");

  // ✅ load products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const res = await fetch("/api/admin/products", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: isAdmin,
    retry: false,
  });

  // 🔥 Stock update mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({
      id,
      stock,
    }: {
      id: number;
      stock: number;
    }) => {
      return apiRequest("PATCH", `/api/admin/products/${id}`, {
        stock,
      });
    },
    onSuccess: async () => {
      toast({ title: "Stock updated" });
      await queryClient.invalidateQueries({
        queryKey: ["/api/admin/products"],
      });
    },
    onError: () => {
      toast({
        title: "Stock update failed",
        description: "Backend PATCH route must be working.",
        variant: "destructive",
      });
    },
  });

  const filtered = useMemo(() => {
    const list = products || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((p) => {
      return `${p.id} ${p.name} ${p.sku ?? ""}`.toLowerCase().includes(q);
    });
  }, [products, search]);

  const totalProducts = products?.length ?? 0;
  const totalStock =
    products?.reduce((sum, p) => sum + Number(p.stock ?? 0), 0) ?? 0;

  const lowStockItems =
    products?.filter((p) => Number(p.stock) <= 10).length ?? 0;

  if (meLoading) return null;
  if (!isAdmin) return <Redirect to="/auth" />;

  return (
    <AdminLayout
      title="Warehouse"
      subtitle="Manage stock, inventory health and low-stock alerts"
    >
      <div className="space-y-8">
        {/* HERO */}
        <div className="rounded-3xl border bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 text-white p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm">
                <Crown className="h-4 w-4" />
                Orivya Eco Warehouse Suite
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Inventory Control Center
              </h1>

              <p className="text-white/80 text-sm md:text-base max-w-xl">
                Monitor stock, prevent out-of-stock issues and update inventory
                instantly.
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
                  Live Inventory
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {totalProducts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Products in your catalog
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Total Stock
              </CardTitle>
              <Boxes className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {totalStock}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Combined stock across all items
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black/70">
                Low Stock Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-black/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {lowStockItems}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Products with stock ≤ 10
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SEARCH */}
        <Card className="rounded-3xl border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Inventory
            </CardTitle>
            <CardDescription>
              Find products by ID, name or SKU
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name / SKU / ID..."
            />

            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">Total: {products?.length ?? 0}</Badge>
              <Badge variant="secondary">Showing: {filtered.length}</Badge>
              <Badge variant="outline">Low Stock: {lowStockItems}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* LIST */}
        <Card className="rounded-3xl border bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Inventory List</CardTitle>
            <CardDescription>
              Update stock instantly (no reload needed)
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Loading warehouse inventory...</p>
            ) : !filtered.length ? (
              <p className="text-black/60">No products found.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((p) => {
                  const low = Number(p.stock) <= 10;

                  return (
                    <div
                      key={p.id}
                      className="rounded-3xl border bg-white p-5 shadow-sm flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <p className="text-lg font-semibold">{p.name}</p>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">ID: {p.id}</Badge>
                            <Badge variant="outline">
                              SKU: {p.sku || "—"}
                            </Badge>
                            <Badge variant="outline">₹{p.price}</Badge>

                            {low ? (
                              <Badge className="bg-red-600 text-white">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-600 text-white">
                                Healthy
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Stock: {p.stock}</Badge>

                            <Input
                              type="number"
                              defaultValue={p.stock}
                              className="w-28"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = Number(
                                    (e.target as HTMLInputElement).value,
                                  );
                                  updateStockMutation.mutate({
                                    id: p.id,
                                    stock: val,
                                  });
                                }
                              }}
                            />
                          </div>

                          <Button
                            variant="secondary"
                            onClick={() => {
                              const el = document.getElementById(
                                `stock-${p.id}`,
                              ) as HTMLInputElement | null;

                              if (!el) return;

                              updateStockMutation.mutate({
                                id: p.id,
                                stock: Number(el.value),
                              });
                            }}
                            disabled={updateStockMutation.isPending}
                            className="hidden"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Update
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-black/50">
                        Tip: Change stock and press <b>Enter</b> to update.
                      </p>

                      {/* Hidden input reference fix */}
                      <input
                        id={`stock-${p.id}`}
                        defaultValue={p.stock}
                        className="hidden"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
