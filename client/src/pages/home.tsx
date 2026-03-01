import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Leaf,
  Crown,
  Droplets,
  Heart,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: string;
  description?: string | null;
  images?: string[] | null;
  stock?: number | null;
  isCombo?: boolean | null;
};

function formatPrice(price: string | number) {
  const num = Number(price || 0);
  return `₹${num.toLocaleString("en-IN")}`;
}

function safeImage(p: Product) {
  if (p.images && p.images.length > 0) return p.images[0];
  return "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1200&q=80";
}

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
    retry: false,
  });

  const featured = useMemo(() => {
    const list = products || [];
    return list.slice(0, 6);
  }, [products]);

  const combos = useMemo(() => {
    const list = products || [];
    return list.filter((p) => p.isCombo).slice(0, 4);
  }, [products]);

  const categories = [
    {
      title: "Skincare",
      desc: "Glow, hydration, and repair",
      icon: Droplets,
      href: "/shop?category=skincare",
    },
    {
      title: "Makeup",
      desc: "Luxury finish, all-day wear",
      icon: Sparkles,
      href: "/shop?category=makeup",
    },
    {
      title: "Haircare",
      desc: "Silky, strong, premium hair",
      icon: Leaf,
      href: "/shop?category=haircare",
    },
    {
      title: "Bodycare",
      desc: "Soft, nourished, radiant skin",
      icon: Heart,
      href: "/shop?category=bodycare",
    },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-white via-zinc-50 to-white">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute top-24 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* LEFT */}
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 backdrop-blur px-4 py-1 text-sm">
                  <Crown className="h-4 w-4" />
                  Orivya Eco — Premium Cosmetics
                </div>

                <h1 className="text-4xl md:text-6xl font-serif font-semibold tracking-tight leading-[1.05]">
                  Luxury beauty,
                  <span className="block bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                    clean & sustainable.
                  </span>
                </h1>

                <p className="text-base md:text-lg text-black/60 max-w-xl">
                  Discover premium skincare, makeup, and body essentials designed
                  with clean ingredients — crafted to elevate your everyday glow.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/shop">
                    <Button className="rounded-2xl h-12 px-6">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Shop Now
                    </Button>
                  </Link>

                  <Link href="/shop?isCombo=true">
                    <Button
                      variant="outline"
                      className="rounded-2xl h-12 px-6"
                    >
                      Explore Combos
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="rounded-full px-4 py-1">
                    Free Shipping (₹1000+)
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-4 py-1">
                    Premium Packaging
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-4 py-1">
                    Clean Ingredients
                  </Badge>
                </div>
              </div>

              {/* RIGHT */}
              <div className="relative">
                <div className="rounded-[2.5rem] border bg-white/60 backdrop-blur shadow-xl overflow-hidden">
                  <div className="aspect-[4/4] w-full">
                    <img
                      src="https://ibb.co/mFH4F5FD"
                      alt="Orivya Luxury 1"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <p className="text-sm text-black/60">
                      Premium collections made for glow & confidence.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">New Collection</div>
                      <Link href="/shop">
                        <Button variant="secondary" className="rounded-2xl">
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating mini card */}
                <div className="hidden md:block absolute -bottom-8 -left-10 w-64 rounded-3xl border bg-white/70 backdrop-blur shadow-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Glow Promise</p>
                      <p className="text-xs text-black/60">
                        Visible results in weeks
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* END RIGHT */}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="container mx-auto px-4 py-14">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold">
                Shop by Category
              </h2>
              <p className="text-sm text-black/60 mt-1">
                Curated collections made for every routine.
              </p>
            </div>

            <Link href="/shop">
              <Button variant="ghost" className="rounded-2xl">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((c) => {
              const Icon = c.icon;

              return (
                <Link key={c.title} href={c.href}>
                  <a>
                    <Card className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm hover:shadow-lg transition overflow-hidden">
                      <div className="p-6 space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-black to-zinc-700 flex items-center justify-center text-white">
                          <Icon className="h-6 w-6" />
                        </div>

                        <div>
                          <p className="text-lg font-semibold">{c.title}</p>
                          <p className="text-sm text-black/60">{c.desc}</p>
                        </div>

                        <p className="text-sm font-medium inline-flex items-center gap-2">
                          Explore <ArrowRight className="h-4 w-4" />
                        </p>
                      </div>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="container mx-auto px-4 py-14">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold">
                Featured Products
              </h2>
              <p className="text-sm text-black/60 mt-1">
                Handpicked bestsellers and premium picks.
              </p>
            </div>

            <Link href="/shop">
              <Button variant="ghost" className="rounded-2xl">
                Shop More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border bg-white p-6 animate-pulse h-[360px]"
                />
              ))}
            </div>
          ) : !featured.length ? (
            <div className="rounded-3xl border bg-white p-10 text-center">
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm text-black/60 mt-1">
                Add products from Admin → Products.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <a className="group">
                    <Card className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm hover:shadow-xl transition overflow-hidden">
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={safeImage(p)}
                          alt={p.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>

                      <div className="p-6 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-lg font-semibold leading-tight">
                            {p.name}
                          </p>
                          {p.isCombo ? (
                            <Badge className="rounded-full bg-black text-white">
                              Combo
                            </Badge>
                          ) : null}
                        </div>

                        <p className="text-sm text-black/60 line-clamp-2">
                          {p.description || "Premium product by Orivya Eco."}
                        </p>

                        <div className="flex items-center justify-between pt-3">
                          <p className="text-lg font-semibold">
                            {formatPrice(p.price)}
                          </p>
                          <Button
                            variant="secondary"
                            className="rounded-2xl"
                          >
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

        {/* COMBO SECTION */}
        <section className="container mx-auto px-4 py-14">
          <div className="rounded-[2.5rem] border bg-gradient-to-br from-violet-700 via-fuchsia-700 to-pink-600 text-white p-10 shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm w-fit">
                  <Sparkles className="h-4 w-4" />
                  Save More with Combos
                </div>

                <h2 className="text-3xl md:text-4xl font-serif font-semibold">
                  Premium sets with extra discount.
                </h2>

                <p className="text-white/80 max-w-xl">
                  Bundles designed for glow, hydration and complete skincare
                  routines — perfect for gifting too.
                </p>

                <Link href="/shop?isCombo=true">
                  <Button className="rounded-2xl bg-white text-black hover:bg-white/90">
                    Explore Combos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(combos.length ? combos : featured.slice(0, 4)).map((p) => (
                  <Link key={p.id} href={`/product/${p.id}`}>
                    <a className="rounded-3xl bg-white/15 border border-white/15 hover:bg-white/20 transition p-5">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-white/70 mt-1 line-clamp-2">
                        {p.description || "Premium combo set"}
                      </p>
                      <p className="mt-3 font-semibold">
                        {formatPrice(p.price)}
                      </p>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="container mx-auto px-4 py-14">
          <div className="rounded-[2.5rem] border bg-white/70 backdrop-blur p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-serif font-semibold">
                  Join the Orivya Circle
                </h2>
                <p className="text-sm text-black/60 max-w-xl">
                  Get early access to new launches, combo deals, and premium
                  skincare tips.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  placeholder="Enter your email"
                  className="h-12 rounded-2xl border px-4 w-full bg-white"
                />
                <Button className="h-12 rounded-2xl px-6">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM SPACE */}
        <div className="h-10" />
      </div>
    </Layout>
  );
}
