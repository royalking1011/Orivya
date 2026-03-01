import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Search,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Crown,
  Tag,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: string;
  description?: string | null;
  images?: string[] | null;
  stock?: number | null;
  isCombo?: boolean | null;
  categoryId?: number | null;
  sku?: string | null;
};

function safeImage(p: Product) {
  if (p.images && p.images.length > 0) return p.images[0];
  return "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1200&q=80";
}

function formatPrice(price: string | number) {
  const num = Number(price || 0);
  return `₹${num.toLocaleString("en-IN")}`;
}

function parseQuery(search: string) {
  const params = new URLSearchParams(search || "");
  return {
    category: params.get("category") || "",
    q: params.get("search") || "",
    isCombo: params.get("isCombo") === "true",
  };
}

export default function ShopPage() {
  const [location, setLocation] = useLocation();

  const queryState = useMemo(() => {
    const qIndex = location.indexOf("?");
    const query = qIndex >= 0 ? location.slice(qIndex + 1) : "";
    return parseQuery(query);
  }, [location]);

  const [search, setSearch] = useState(queryState.q);
  const [category, setCategory] = useState(queryState.category);
  const [isComboOnly, setIsComboOnly] = useState(queryState.isCombo);
  const [sort, setSort] = useState<
    "featured" | "price_low" | "price_high" | "name"
  >("featured");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
    retry: false,
  });

  const categories = [
    { key: "", label: "All" },
    { key: "skincare", label: "Skincare" },
    { key: "makeup", label: "Makeup" },
    { key: "haircare", label: "Haircare" },
    { key: "bodycare", label: "Bodycare" },
    { key: "combos", label: "Combos" },
  ];

  // ✅ Filter + sort locally (no DB dependency)
  const filtered = useMemo(() => {
    const list = products || [];
    const q = search.trim().toLowerCase();

    let out = list;

    // Search
    if (q) {
      out = out.filter((p) =>
        `${p.name} ${p.description || ""} ${p.sku || ""}`
          .toLowerCase()
          .includes(q),
      );
    }

    // Combos
    if (isComboOnly) {
      out = out.filter((p) => p.isCombo);
    }

    // Category (only works properly once you map categoryId -> slug)
    // For now: if user selects Combos category, show combos.
    if (category === "combos") {
      out = out.filter((p) => p.isCombo);
    }

    // Sort
    if (sort === "price_low") {
      out = [...out].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price_high") {
      out = [...out].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "name") {
      out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    }

    return out;
  }, [products, search, category, isComboOnly, sort]);

  // Update URL query
  function updateUrl(next: { category?: string; search?: string; isCombo?: boolean }) {
    const params = new URLSearchParams();

    const c = next.category ?? category;
    const s = next.search ?? search;
    const combo = next.isCombo ?? isComboOnly;

    if (c) params.set("category", c);
    if (s) params.set("search", s);
    if (combo) params.set("isCombo", "true");

    setLocation(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-white via-zinc-50 to-white min-h-screen">
        {/* HERO */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-violet-500/20 blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 py-14 md:py-16">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 backdrop-blur px-4 py-1 text-sm w-fit">
                  <Crown className="h-4 w-4" />
                  Orivya Eco Store
                </div>

                <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight">
                  Shop Premium Collections
                </h1>

                <p className="text-sm md:text-base text-black/60 max-w-2xl">
                  Discover skincare, makeup, haircare, bodycare and combo bundles
                  crafted for luxury results.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full px-4 py-1">
                  Products: {filtered.length}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* FILTER BAR */}
        <section className="container mx-auto px-4 py-10">
          <Card className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Search</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onBlur={() => updateUrl({ search })}
                      placeholder="Search products..."
                      className="pl-10 rounded-2xl"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Category</p>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      updateUrl({ category: e.target.value });
                    }}
                    className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
                  >
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sort</p>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                    className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
                  >
                    <option value="featured">Featured</option>
                    <option value="price_low">Price: Low → High</option>
                    <option value="price_high">Price: High → Low</option>
                    <option value="name">Name A → Z</option>
                  </select>
                </div>
              </div>

              {/* Combo toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  onClick={() => {
                    setIsComboOnly(!isComboOnly);
                    updateUrl({ isCombo: !isComboOnly });
                  }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition inline-flex items-center gap-2 ${
                    isComboOnly
                      ? "bg-black text-white border-black"
                      : "bg-white hover:bg-black/5"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Show Combos Only
                </button>

                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setIsComboOnly(false);
                    setSort("featured");
                    setLocation("/shop");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* PRODUCT GRID */}
        <section className="container mx-auto px-4 pb-20">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border bg-white p-6 animate-pulse h-[360px]"
                />
              ))}
            </div>
          ) : !filtered.length ? (
            <div className="rounded-3xl border bg-white p-12 text-center">
              <p className="text-xl font-semibold">No products found</p>
              <p className="text-sm text-black/60 mt-1">
                Try changing filters or search keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <a className="group">
                    <Card className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm hover:shadow-xl transition overflow-hidden">
                      <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <img
                          src={safeImage(p)}
                          alt={p.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />

                        {p.isCombo ? (
                          <div className="absolute top-4 left-4">
                            <Badge className="rounded-full bg-black text-white">
                              <Tag className="h-3 w-3 mr-1" />
                              Combo Deal
                            </Badge>
                          </div>
                        ) : null}
                      </div>

                      <div className="p-6 space-y-2">
                        <p className="text-lg font-semibold leading-tight">
                          {p.name}
                        </p>

                        <p className="text-sm text-black/60 line-clamp-2">
                          {p.description || "Premium product by Orivya Eco."}
                        </p>

                        <div className="flex items-center justify-between pt-3">
                          <p className="text-lg font-semibold">
                            {formatPrice(p.price)}
                          </p>

                          <Button variant="secondary" className="rounded-2xl">
                            View
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
