import AdminLayout from "@/pages/admin-layout";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Package,
  Search,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  Image as ImageIcon,
  BadgePercent,
  Boxes,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number;
  name: string;
  sku?: string | null;
  description: string;
  price: string;
  categoryId?: number | null;
  images: string[];
  isCombo?: boolean | null;
  comboDiscount?: string | null;
  stock: number;
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

function money(v: string | number) {
  const n = Number(v || 0);
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function AdminProducts() {
  const { toast } = useToast();

  // =========================
  // DATA
  // =========================
  const {
    data: products,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const res = await fetch("/api/admin/products", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    retry: false,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    retry: false,
  });

  // =========================
  // UI STATE
  // =========================
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [comboFilter, setComboFilter] = useState<"all" | "combo" | "normal">(
    "all",
  );

  const list = products ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return list.filter((p) => {
      const matchesSearch =
        !q ||
        `${p.id} ${p.name} ${p.sku ?? ""} ${p.description}`
          .toLowerCase()
          .includes(q);

      const matchesCategory =
        categoryFilter === "all"
          ? true
          : String(p.categoryId ?? "") === categoryFilter;

      const matchesCombo =
        comboFilter === "all"
          ? true
          : comboFilter === "combo"
            ? !!p.isCombo
            : !p.isCombo;

      return matchesSearch && matchesCategory && matchesCombo;
    });
  }, [list, search, categoryFilter, comboFilter]);

  // =========================
  // STATS
  // =========================
  const totalProducts = list.length;
  const totalCombos = list.filter((x) => x.isCombo).length;
  const totalStock = list.reduce((sum, p) => sum + Number(p.stock || 0), 0);

  // =========================
  // MODAL STATE
  // =========================
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<Product | null>(null);
  const [openDelete, setOpenDelete] = useState<Product | null>(null);

  // =========================
  // FORM STATE
  // =========================
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: "",
    categoryId: undefined,
    images: [""],
    stock: 0,
    isCombo: false,
    comboDiscount: "",
  });

  function resetForm() {
    setForm({
      name: "",
      description: "",
      price: "",
      categoryId: undefined,
      images: [""],
      stock: 0,
      isCombo: false,
      comboDiscount: "",
    });
  }

  function setEditForm(p: Product) {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      categoryId: p.categoryId ?? undefined,
      images: p.images?.length ? p.images : [""],
      stock: p.stock ?? 0,
      isCombo: !!p.isCombo,
      comboDiscount: p.comboDiscount ?? "",
    });
  }

  // =========================
  // MUTATIONS
  // =========================
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim(),
        price: String(form.price ?? "").trim(),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        images: (form.images || []).filter((x) => x.trim()),
        stock: Number(form.stock ?? 0),
        isCombo: !!form.isCombo,
        comboDiscount: form.isCombo
          ? String(form.comboDiscount || "").trim()
          : null,
      };

      return apiRequest("POST", "/api/admin/products", payload);
    },
    onSuccess: async () => {
      toast({ title: "Product created" });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setOpenCreate(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to create product",
        description: "Check required fields & backend logs.",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!openEdit) return;

      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim(),
        price: String(form.price ?? "").trim(),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        images: (form.images || []).filter((x) => x.trim()),
        stock: Number(form.stock ?? 0),
        isCombo: !!form.isCombo,
        comboDiscount: form.isCombo
          ? String(form.comboDiscount || "").trim()
          : null,
      };

      return apiRequest("PATCH", `/api/admin/products/${openEdit.id}`, payload);
    },
    onSuccess: async () => {
      toast({ title: "Product updated" });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setOpenEdit(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to update product",
        description: "Check backend logs.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!openDelete) return;
      return apiRequest("DELETE", `/api/admin/products/${openDelete.id}`);
    },
    onSuccess: async () => {
      toast({ title: "Product deleted" });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setOpenDelete(null);
    },
    onError: () => {
      toast({
        title: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // =========================
  // VALIDATION
  // =========================
  const canSubmit =
    !!form.name?.trim() &&
    !!form.description?.trim() &&
    !!String(form.price || "").trim() &&
    (form.images || []).some((x) => x.trim());

  // =========================
  // UI
  // =========================
  return (
    <AdminLayout
      title="Products"
      subtitle="Manage products, stock, combos and pricing"
    >
      <div className="space-y-8">
        {/* HERO */}
        <div className="rounded-3xl border bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm w-fit">
                <Sparkles className="h-4 w-4" />
                Orivya Eco Products Suite
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Product Management
              </h1>

              <p className="text-white/70 text-sm md:text-base max-w-2xl">
                Create products, edit pricing, manage combos, update stock and
                keep your store clean and premium.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button
                className="rounded-2xl"
                onClick={() => {
                  resetForm();
                  setOpenCreate(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
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
              Total Products: {totalProducts}
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/10 text-white">
              Combos: {totalCombos}
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/10 text-white">
              Total Stock: {totalStock}
            </Badge>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="rounded-3xl shadow-sm border bg-white lg:col-span-2">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Search className="h-4 w-4" />
                Search Products
              </div>

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, SKU, description..."
                className="rounded-2xl"
              />

              <p className="text-xs text-black/50">
                Tip: Search “serum”, “lipstick”, “ORV-”, etc.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Boxes className="h-4 w-4" />
                Filters
              </div>

              {/* Category */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
              >
                <option value="all">All Categories</option>
                {(categories || []).map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Combo */}
              <select
                value={comboFilter}
                onChange={(e) => setComboFilter(e.target.value as any)}
                className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
              >
                <option value="all">All Products</option>
                <option value="normal">Normal Only</option>
                <option value="combo">Combos Only</option>
              </select>
            </CardContent>
          </Card>
        </div>

        {/* PRODUCT LIST */}
        <Card className="rounded-3xl shadow-sm border bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product List
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-sm text-black/60">
                Loading products...
              </div>
            ) : !filtered.length ? (
              <div className="p-6 text-sm text-black/60">
                No products found.
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b">
                    <tr className="text-left">
                      <th className="p-4 font-semibold">ID</th>
                      <th className="p-4 font-semibold">Product</th>
                      <th className="p-4 font-semibold">Price</th>
                      <th className="p-4 font-semibold">Stock</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Created</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b hover:bg-zinc-50 transition"
                      >
                        <td className="p-4 font-medium">#{p.id}</td>

                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-2xl border bg-white overflow-hidden flex items-center justify-center">
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-black/40" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="font-semibold">{p.name}</div>

                              <div className="text-xs text-black/50 line-clamp-1">
                                {p.description}
                              </div>

                              {p.sku ? (
                                <Badge variant="outline" className="rounded-full">
                                  SKU: {p.sku}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 font-semibold">
                            <IndianRupee className="h-4 w-4 text-black/40" />
                            {money(p.price)}
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge variant="outline" className="rounded-full">
                            {p.stock ?? 0}
                          </Badge>
                        </td>

                        <td className="p-4">
                          {p.isCombo ? (
                            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/20">
                              <BadgePercent className="h-3.5 w-3.5" />
                              Combo{" "}
                              {p.comboDiscount
                                ? `(${p.comboDiscount}%)`
                                : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                              Normal
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-black/60 text-xs">
                          {formatDate(p.createdAt)}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() => {
                                setOpenEdit(p);
                                setEditForm(p);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>

                            <Button
                              variant="destructive"
                              className="rounded-2xl"
                              onClick={() => setOpenDelete(p)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
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

        {/* =========================
            MODALS (CREATE / EDIT / DELETE)
            ========================= */}

        {/* CREATE */}
        {openCreate ? (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl border overflow-hidden">
              <div className="p-6 border-b">
                <p className="text-lg font-semibold">Add Product</p>
                <p className="text-sm text-black/60">
                  Fill details and create a new product.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <Input
                  value={form.name || ""}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Product name"
                  className="rounded-2xl"
                />

                <Input
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Description"
                  className="rounded-2xl"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="Price (ex: 1999)"
                    className="rounded-2xl"
                  />

                  <Input
                    value={String(form.stock ?? 0)}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stock: Number(e.target.value) }))
                    }
                    placeholder="Stock"
                    className="rounded-2xl"
                    type="number"
                  />
                </div>

                <select
                  value={form.categoryId ? String(form.categoryId) : ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      categoryId: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
                >
                  <option value="">Select Category</option>
                  {(categories || []).map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Image URL</p>
                  <Input
                    value={form.images?.[0] || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, images: [e.target.value] }))
                    }
                    placeholder="https://image-url.com/photo.jpg"
                    className="rounded-2xl"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!form.isCombo}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isCombo: e.target.checked }))
                    }
                  />
                  <span className="text-sm font-medium">Is Combo Product?</span>
                </div>

                {form.isCombo ? (
                  <Input
                    value={form.comboDiscount || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, comboDiscount: e.target.value }))
                    }
                    placeholder="Combo Discount % (ex: 15)"
                    className="rounded-2xl"
                  />
                ) : null}
              </div>

              <div className="p-6 border-t flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setOpenCreate(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  className="rounded-2xl"
                  disabled={!canSubmit || createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                >
                  {createMutation.isPending ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* EDIT */}
        {openEdit ? (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl border overflow-hidden">
              <div className="p-6 border-b">
                <p className="text-lg font-semibold">Edit Product</p>
                <p className="text-sm text-black/60">
                  Update details for:{" "}
                  <span className="font-semibold">{openEdit.name}</span>
                </p>
              </div>

              <div className="p-6 space-y-4">
                <Input
                  value={form.name || ""}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Product name"
                  className="rounded-2xl"
                />

                <Input
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Description"
                  className="rounded-2xl"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="Price"
                    className="rounded-2xl"
                  />

                  <Input
                    value={String(form.stock ?? 0)}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stock: Number(e.target.value) }))
                    }
                    placeholder="Stock"
                    className="rounded-2xl"
                    type="number"
                  />
                </div>

                <select
                  value={form.categoryId ? String(form.categoryId) : ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      categoryId: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
                >
                  <option value="">Select Category</option>
                  {(categories || []).map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Image URL</p>
                  <Input
                    value={form.images?.[0] || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, images: [e.target.value] }))
                    }
                    placeholder="https://image-url.com/photo.jpg"
                    className="rounded-2xl"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!form.isCombo}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isCombo: e.target.checked }))
                    }
                  />
                  <span className="text-sm font-medium">Is Combo Product?</span>
                </div>

                {form.isCombo ? (
                  <Input
                    value={form.comboDiscount || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, comboDiscount: e.target.value }))
                    }
                    placeholder="Combo Discount %"
                    className="rounded-2xl"
                  />
                ) : null}
              </div>

              <div className="p-6 border-t flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setOpenEdit(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  className="rounded-2xl"
                  disabled={!canSubmit || editMutation.isPending}
                  onClick={() => editMutation.mutate()}
                >
                  {editMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* DELETE */}
        {openDelete ? (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border overflow-hidden">
              <div className="p-6 border-b">
                <p className="text-lg font-semibold">Delete Product</p>
                <p className="text-sm text-black/60">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{openDelete.name}</span>?
                </p>
              </div>

              <div className="p-6 text-sm text-black/70 space-y-2">
                <p>⚠️ This action cannot be undone.</p>
                <p>
                  Product ID: <span className="font-semibold">#{openDelete.id}</span>
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
