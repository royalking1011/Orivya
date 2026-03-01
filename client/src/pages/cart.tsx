import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
  Sparkles,
} from "lucide-react";

function formatPrice(price: string | number) {
  const num = Number(price || 0);
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const cart = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const subtotal = cart.items.reduce((sum, i) => {
    return sum + Number(i.price) * Number(i.quantity || 1);
  }, 0);

  const shipping = subtotal > 999 ? 0 : subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  const hasItems = cart.items.length > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-white">
        <div className="container mx-auto px-4 pt-10 pb-20 space-y-8">
          {/* TOP BAR */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-black/60 text-sm">
                <ShoppingBag className="h-4 w-4" />
                Your Cart
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight">
                Shopping Cart
              </h1>

              <p className="text-sm text-black/60 mt-1">
                Review your items before checkout.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/shop">
                <a>
                  <Button variant="outline" className="rounded-2xl">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </a>
              </Link>

              {hasItems ? (
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => {
                    cart.clearCart();
                    toast({
                      title: "Cart cleared",
                      description: "All items removed from your cart.",
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              ) : null}
            </div>
          </div>

          {/* EMPTY CART */}
          {!hasItems ? (
            <Card className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm p-10 text-center space-y-3">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-black text-white flex items-center justify-center">
                <ShoppingBag className="h-6 w-6" />
              </div>

              <h2 className="text-2xl font-serif font-semibold">
                Your cart is empty
              </h2>

              <p className="text-sm text-black/60 max-w-md mx-auto">
                Add some premium Orivya Eco products to your cart and come back
                here.
              </p>

              <div className="pt-3">
                <Link href="/shop">
                  <a>
                    <Button className="rounded-2xl h-11 px-6">
                      Explore Products
                    </Button>
                  </a>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ITEMS */}
              <div className="lg:col-span-2 space-y-5">
                {cart.items.map((item) => {
                  const lineTotal =
                    Number(item.price) * Number(item.quantity || 1);

                  return (
                    <Card
                      key={item.id}
                      className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm overflow-hidden"
                    >
                      <div className="p-6 flex flex-col sm:flex-row gap-5">
                        {/* IMAGE */}
                        <div className="h-28 w-full sm:w-28 rounded-2xl overflow-hidden border bg-white">
                          <img
                            src={
                              item.image ||
                              "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&q=80"
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* DETAILS */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-lg font-semibold leading-tight">
                                {item.name}
                              </p>
                              <p className="text-sm text-black/60">
                                Price:{" "}
                                <span className="font-semibold text-black">
                                  {formatPrice(item.price)}
                                </span>
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              className="rounded-2xl text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => {
                                cart.removeItem(item.id);
                                toast({
                                  title: "Removed",
                                  description: `${item.name} removed from cart.`,
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>

                          {/* QTY */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="rounded-2xl"
                                onClick={() =>
                                  cart.updateQuantity(
                                    item.id,
                                    Math.max(1, (item.quantity || 1) - 1),
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <div className="min-w-[52px] text-center font-semibold">
                                {item.quantity || 1}
                              </div>

                              <Button
                                variant="outline"
                                size="icon"
                                className="rounded-2xl"
                                onClick={() =>
                                  cart.updateQuantity(
                                    item.id,
                                    (item.quantity || 1) + 1,
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>

                              <Badge
                                variant="outline"
                                className="rounded-full ml-2"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-black/50">
                                Line Total
                              </p>
                              <p className="text-lg font-semibold">
                                {formatPrice(lineTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* SUMMARY */}
              <div className="space-y-5">
                <Card className="rounded-3xl border bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white shadow-xl overflow-hidden">
                  <div className="p-7 space-y-5 relative">
                    <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

                    <div className="relative space-y-1">
                      <p className="text-white/70 text-sm">Order Summary</p>
                      <h2 className="text-2xl font-serif font-semibold">
                        Total Checkout
                      </h2>
                    </div>

                    <div className="relative space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Subtotal</span>
                        <span className="font-semibold">
                          {formatPrice(subtotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Shipping</span>
                        <span className="font-semibold">
                          {shipping === 0 ? "Free" : formatPrice(shipping)}
                        </span>
                      </div>

                      <Separator className="bg-white/10" />

                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Grand Total</span>
                        <span className="text-2xl font-semibold">
                          {formatPrice(total)}
                        </span>
                      </div>

                      {subtotal > 0 && subtotal < 999 ? (
                        <p className="text-xs text-white/60">
                          Add {formatPrice(999 - subtotal)} more to get free
                          shipping.
                        </p>
                      ) : null}
                    </div>

                    <div className="relative pt-2 space-y-3">
                      <Button
                        className="w-full rounded-2xl h-12 text-base bg-white text-black hover:bg-white/90"
                        onClick={() => setLocation("/checkout")}
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Proceed to Checkout
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full rounded-2xl h-12 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setLocation("/shop")}
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* INFO BOX */}
                <Card className="rounded-3xl border bg-white/70 backdrop-blur shadow-sm">
                  <div className="p-6 space-y-2">
                    <p className="font-semibold">Why shop with Orivya?</p>
                    <p className="text-sm text-black/60 leading-relaxed">
                      Premium products, safe checkout, fast dispatch and easy
                      support. We focus on quality and luxury experience.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
