import { useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

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

function safeImage(p?: Product, index = 0) {
  if (!p) return "";
  if (p.images && p.images.length > 0) return p.images[index] || p.images[0];
  return "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1200&q=80";
}

function formatPrice(price: string | number) {
  const num = Number(price || 0);
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const { toast } = useToast();
  const cart = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
    retry: false,
    enabled: !!id,
  });

  // Related products (simple)
  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    retry: false,
  });

  const related = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 6);
  }, [product, allProducts]);

  const images = product?.images?.length
    ? product.images
    : [safeImage(product, 0)];

  const inStock = (product?.stock ?? 0) > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-white">
        {/* TOP */}
        <div className="container mx-auto px-4 pt-8 pb-4">
          <Link href="/shop">
            <a className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black transition">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </a>
          </Link>
        </div>

        {/* MAIN */}
        <section className="container mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="rounded-3xl border bg-white h-[420px] animate-pulse" />
              <div className="rounded-3xl border bg-white h-[420px] animate-pulse" />
            </div>
          ) : !product ? (
            <div className="rounded-3xl border bg-white p-12 text-center">
              <p className="text-xl font-semibold">Product not found</p>
              <p className="text-sm text-black/60 mt-1">
                This product may be removed or unavailable.
              </p>
              <div className="mt-6">
                <Link href="/shop">
                  <a>
                    <Button className="rounded-2xl">Go to Shop</Button>
                  </a>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT: IMAGES */}
              <div className="space-y-4">
                <Card className="rounded-3xl border overflow-hidden bg-white/70 backdrop-blur shadow-sm">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={safeImage(product, selectedImage)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />

                    {product.isCombo ? (
                      <div className="absolute top-4 left-4">
                        <Badge className="rounded-full bg-black text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Combo Deal
                        </Badge>
                      </div>
                    ) : null}
                  </div>
                </Card>

                {/* THUMBNAILS */}
                {images.length > 1 ? (
                  <div className="flex gap-3 overflow-auto pb-2">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`h-20 w-24 rounded-2xl overflow-hidden border transition ${
                          selectedImage === i
                            ? "border-black"
                            : "border-black/10 hover:border-black/30"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Preview ${i}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* RIGHT: DETAILS */}
              <div className="space-y-6">
                {/* HERO */}
                <div className="rounded-3xl border bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

                  <div className="relative space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/10 hover:bg-white/10 text-white rounded-full">
                        ORIVYA ECO
                      </Badge>

                      {inStock ? (
                        <Badge className="bg-emerald-500/15 hover:bg-emerald-500/15 text-emerald-200 rounded-full">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/15 hover:bg-rose-500/15 text-rose-200 rounded-full">
                          Out of Stock
                        </Badge>
                      )}

                      {product.sku ? (
                        <Badge className="bg-white/10 hover:bg-white/10 text-white rounded-full">
                          SKU: {product.sku}
                        </Badge>
                      ) : null}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight">
                      {product.name}
                    </h1>

                    <p className="text-white/70 text-sm md:text-base">
                      {product.description ||
                        "Premium Orivya Eco product crafted for luxury results."}
                    </p>

                    <div className="pt-4 flex items-end justify-between">
                      <p className="text-3xl font-semibold">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-sm text-white/60">
                        {product.stock ?? 0} available
                      </p>
                    </div>
                  </div>
                </div>

                {/* BUY BOX */}
                <Card className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm">
                  <div className="p-6 space-y-5">
                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Quantity</p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-2xl"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <div className="min-w-[52px] text-center font-semibold">
                          {qty}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-2xl"
                          onClick={() => setQty((q) => q + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Add to cart */}
                    <Button
                      className="w-full rounded-2xl h-12 text-base"
                      disabled={!inStock}
                      onClick={() => {
                        cart.addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: safeImage(product, 0),
                          quantity: qty,
                        });

                        toast({
                          title: "Added to cart",
                          description: `${product.name} x${qty}`,
                        });
                      }}
                    >
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>

                    {/* Trust */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-2xl border bg-white p-4 flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-black/60" />
                        <div>
                          <p className="text-sm font-semibold">Secure Checkout</p>
                          <p className="text-xs text-black/60">
                            Safe payments & privacy
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-white p-4 flex items-center gap-3">
                        <Truck className="h-5 w-5 text-black/60" />
                        <div>
                          <p className="text-sm font-semibold">Fast Delivery</p>
                          <p className="text-xs text-black/60">
                            Quick dispatch & tracking
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </section>

        {/* RELATED */}
        {product && related.length > 0 ? (
          <section className="container mx-auto px-4 pb-24">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-serif font-semibold">
                  You may also like
                </h2>
                <p className="text-sm text-black/60">
                  More premium Orivya products
                </p>
              </div>

              <Link href="/shop">
                <a>
                  <Button variant="outline" className="rounded-2xl">
                    View All
                  </Button>
                </a>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <a className="group">
                    <Card className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm hover:shadow-xl transition overflow-hidden">
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={safeImage(p, 0)}
                          alt={p.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>

                      <div className="p-6 space-y-2">
                        <p className="text-lg font-semibold">{p.name}</p>
                        <p className="text-sm text-black/60 line-clamp-2">
                          {p.description || "Premium Orivya Eco product."}
                        </p>

                        <div className="flex items-center justify-between pt-3">
                          <p className="text-lg font-semibold">
                            {formatPrice(p.price)}
                          </p>

                          <Button variant="secondary" className="rounded-2xl">
                            View
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </Layout>
  );
}
