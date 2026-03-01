import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Hash,
  Mail,
  Truck,
  Package,
  BadgeCheck,
  Clock,
  XCircle,
  MapPin,
} from "lucide-react";

type LocalOrder = {
  id: number;
  createdAt: string;
  status: string;
  totalAmount: string;
  trackingNumber?: string | null;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    productId: number;
    name: string;
    price: string;
    quantity: number;
  }[];
};

function getLocalOrders(): LocalOrder[] {
  try {
    const raw = localStorage.getItem("orivya_orders");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function formatDate(date?: string) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}

function statusIcon(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return Clock;
  if (s === "confirmed") return BadgeCheck;
  if (s === "packed") return Package;
  if (s === "shipped") return Truck;
  if (s === "delivered") return BadgeCheck;
  if (s === "cancelled") return XCircle;
  return Clock;
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

export default function TrackOrderPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const orders = useMemo(() => getLocalOrders(), []);

  const params = new URLSearchParams(window.location.search);
  const prefilled = params.get("order");

  const [orderId, setOrderId] = useState(prefilled || "");
  const [email, setEmail] = useState(user?.email || "");
  const [found, setFound] = useState<LocalOrder | null>(null);
  const [error, setError] = useState("");

  // ✅ LOGGED IN = show all orders automatically
  const loggedInOrders = user ? orders : [];

  function searchOrder() {
    setError("");
    setFound(null);

    const id = Number(orderId);

    if (!id || !email.trim()) {
      setError("Please enter Order ID and Email.");
      return;
    }

    // NOTE:
    // In DB version, we will verify email with order owner.
    // For localStorage version, we only simulate.
    const match = orders.find((o) => o.id === id);

    if (!match) {
      setError("Order not found. Please check Order ID.");
      return;
    }

    setFound(match);
  }

  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-10 space-y-8">
          {/* HEADER */}
          <div className="rounded-3xl border bg-white/70 backdrop-blur p-8 shadow-sm">
            <h1 className="text-3xl font-semibold tracking-tight">
              Track Your Order
            </h1>
            <p className="text-sm text-black/60 mt-2">
              View order status, tracking number, and order details.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => setLocation("/shop")}
              >
                Continue Shopping
              </Button>

              {user ? (
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => setLocation("/profile")}
                >
                  Back to Profile
                </Button>
              ) : null}
            </div>
          </div>

          {/* LOGGED IN = SHOW ALL */}
          {user ? (
            <Card className="rounded-3xl border bg-white shadow-sm">
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {!loggedInOrders.length ? (
                  <p className="text-sm text-black/60">
                    No orders found yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {loggedInOrders.map((o) => {
                      const Icon = statusIcon(o.status);

                      return (
                        <div
                          key={o.id}
                          className="rounded-3xl border bg-white p-6 shadow-sm space-y-3"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="space-y-2">
                              <p className="text-lg font-semibold flex items-center gap-2">
                                <Hash className="h-4 w-4 text-black/40" />
                                Order #{o.id}
                              </p>

                              <p className="text-xs text-black/50">
                                {formatDate(o.createdAt)}
                              </p>

                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyle(
                                  o.status,
                                )}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {o.status}
                              </span>

                              <p className="text-sm text-black/70">
                                Total:{" "}
                                <span className="font-semibold text-black">
                                  ₹{Number(o.totalAmount).toFixed(2)}
                                </span>
                              </p>

                              <p className="text-xs text-black/50">
                                Tracking:{" "}
                                <span className="font-medium text-black">
                                  {o.trackingNumber || "Not added yet"}
                                </span>
                              </p>
                            </div>

                            <div className="space-y-2 text-sm text-black/60">
                              <p className="font-medium text-black flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-black/40" />
                                Shipping
                              </p>
                              <p>{o.shippingAddress.fullName}</p>
                              <p>
                                {o.shippingAddress.address},{" "}
                                {o.shippingAddress.city},{" "}
                                {o.shippingAddress.state} -{" "}
                                {o.shippingAddress.pincode}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="font-semibold text-sm">Items</p>
                            <div className="space-y-2">
                              {o.items.map((i, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-2xl border bg-white p-4 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-medium">{i.name}</p>
                                    <p className="text-xs text-black/60">
                                      Qty: {i.quantity}
                                    </p>
                                  </div>

                                  <p className="font-semibold">
                                    ₹{(Number(i.price) * i.quantity).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* NOT LOGGED IN = SEARCH FORM */
            <Card className="rounded-3xl border bg-white shadow-sm max-w-2xl">
              <CardHeader>
                <CardTitle>Track by Order ID</CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-black/50" />
                      Order ID
                    </Label>
                    <Input
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Example: 1001"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-black/50" />
                      Email
                    </Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                {error ? (
                  <p className="text-sm text-rose-600 font-medium">{error}</p>
                ) : null}

                <Button className="rounded-2xl w-full" onClick={searchOrder}>
                  Track Order
                </Button>

                {found ? (
                  <div className="rounded-3xl border p-6 bg-white space-y-3">
                    <p className="font-semibold">
                      Order #{found.id}{" "}
                      <Badge variant="outline" className="ml-2">
                        {found.status}
                      </Badge>
                    </p>

                    <p className="text-sm text-black/60">
                      Created: {formatDate(found.createdAt)}
                    </p>

                    <p className="text-sm text-black/60">
                      Total:{" "}
                      <span className="font-semibold text-black">
                        ₹{Number(found.totalAmount).toFixed(2)}
                      </span>
                    </p>

                    <p className="text-sm text-black/60">
                      Tracking:{" "}
                      <span className="font-semibold text-black">
                        {found.trackingNumber || "Not added yet"}
                      </span>
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
