import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMemo } from "react";
import {
  Package,
  Truck,
  BadgeCheck,
  Clock,
  XCircle,
  MapPin,
  Hash,
  CreditCard,
} from "lucide-react";

type PaymentMethod = "cod" | "online";

type LocalOrder = {
  id: number;
  createdAt: string;
  status: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid";
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
    image?: string | null;
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
  if (s === "packed") return Package;
  if (s === "shipped") return Truck;
  if (s === "delivered") return BadgeCheck;
  if (s === "cancelled") return XCircle;

  return Clock;
}

function formatDate(date?: string) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // 🔥 IMPORTANT:
  // Since you are using localStorage orders (no DB),
  // we show orders even if user is logged in or not.
  // But for real website later, this will be per user.
  const orders = useMemo(() => getLocalOrders(), []);

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
          <div className="container mx-auto px-4 py-14">
            <Card className="rounded-3xl border bg-white shadow-sm max-w-xl mx-auto">
              <CardContent className="p-10 text-center space-y-4">
                <p className="text-2xl font-semibold">Please login</p>
                <p className="text-sm text-black/60">
                  Login to see your profile and orders.
                </p>
                <Button
                  className="rounded-2xl"
                  onClick={() => setLocation("/auth")}
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-10 space-y-8">
          {/* HEADER */}
          <div className="rounded-3xl border bg-white/70 backdrop-blur p-8 shadow-sm">
            <h1 className="text-3xl font-semibold tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-black/60 mt-2">
              View your account and order history.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-full">
                {user.email}
              </Badge>
              <Badge variant="outline" className="rounded-full capitalize">
                {user.role?.replaceAll("_", " ")}
              </Badge>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => setLocation("/track-order")}
              >
                Track My Orders
              </Button>

              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={async () => {
                  await logout();
                  toast({ title: "Logged out" });
                  setLocation("/");
                }}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* ORDERS */}
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {!orders.length ? (
                <p className="text-sm text-black/60">
                  No orders yet. Place your first order from Shop.
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => {
                    const Icon = statusIcon(o.status);

                    return (
                      <div
                        key={o.id}
                        className="rounded-3xl border bg-white p-6 shadow-sm space-y-4"
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

                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyle(
                                  o.status,
                                )}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {o.status}
                              </span>

                              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium bg-zinc-500/10 text-zinc-700 border-zinc-500/20 capitalize">
                                <CreditCard className="h-3.5 w-3.5" />
                                {o.paymentMethod}
                              </span>
                            </div>

                            <p className="text-sm text-black/70">
                              Total:{" "}
                              <span className="font-semibold text-black">
                                ₹{Number(o.totalAmount).toFixed(2)}
                              </span>
                            </p>
                          </div>

                          <div className="space-y-2 text-sm text-black/60">
                            <p className="font-medium text-black flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-black/40" />
                              Shipping Address
                            </p>
                            <p>{o.shippingAddress.fullName}</p>
                            <p>
                              {o.shippingAddress.address}, {o.shippingAddress.city},{" "}
                              {o.shippingAddress.state} - {o.shippingAddress.pincode}
                            </p>
                            <p>Phone: {o.shippingAddress.phone}</p>
                          </div>
                        </div>

                        {/* ITEMS */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Items</p>
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

                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => setLocation(`/track-order?order=${o.id}`)}
                          >
                            Track this order
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
