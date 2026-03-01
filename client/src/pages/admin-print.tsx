import AdminLayout from "@/pages/admin-layout";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  PackageCheck,
  Search,
  Truck,
  BadgeCheck,
  Clock,
  XCircle,
  ShoppingBag,
  Printer,
  CreditCard,
  Hash,
  Eye,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Order = {
  id: number;
  status: string;
  trackingNumber?: string | null;
  totalAmount: string;
  paymentStatus?: string | null;
  createdAt?: string;
};

type OrderDetail = {
  order: Order;
  items: {
    id: number;
    productId: number;
    quantity: number;
    price: string;
    productName: string;
  }[];
};

function formatDate(date?: string) {
  if (!date) return null;
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
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

function paymentStyle(payment: string) {
  const p = (payment || "").toLowerCase();

  if (p === "paid")
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (p === "pending")
    return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  if (p === "failed")
    return "bg-rose-500/10 text-rose-700 border-rose-500/20";
  if (p === "refunded")
    return "bg-zinc-500/10 text-zinc-700 border-zinc-500/20";

  return "bg-zinc-500/10 text-zinc-700 border-zinc-500/20";
}

function statusIcon(status: string) {
  const s = (status || "").toLowerCase();

  if (s === "pending") return Clock;
  if (s === "confirmed") return BadgeCheck;
  if (s === "packed") return PackageCheck;
  if (s === "shipped") return Truck;
  if (s === "delivered") return ShoppingBag;
  if (s === "cancelled") return XCircle;

  return Clock;
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: detail } = useQuery<OrderDetail>({
    queryKey: ["/api/admin/orders", selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${selectedId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load order details");
      return res.json();
    },
    enabled: !!selectedId,
    retry: false,
  });

  const filtered = useMemo(() => {
    const list = orders || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((o) => {
      return `${o.id} ${o.status} ${o.trackingNumber ?? ""} ${o.paymentStatus ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [orders, search]);

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      paymentStatus,
      trackingNumber,
    }: {
      id: number;
      status?: string;
      paymentStatus?: string;
      trackingNumber?: string;
    }) => {
      return apiRequest("PATCH", `/api/admin/orders/${id}`, {
        status,
        paymentStatus,
        trackingNumber,
      });
    },
    onSuccess: async () => {
      toast({ title: "Order updated successfully" });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      if (selectedId) {
        await queryClient.invalidateQueries({
          queryKey: ["/api/admin/orders", selectedId],
        });
      }
    },
    onError: () => {
      toast({
        title: "Failed to update order",
        description: "Check backend routes and admin login.",
        variant: "destructive",
      });
    },
  });

  const statuses = [
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const payments = ["pending", "paid", "failed", "refunded"];

  function printInvoice() {
    if (!detail) return;

    const o = detail.order;
    const items = detail.items;

    const html = `
      <html>
      <head>
        <title>Invoice #${o.id}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Invoice</h1>
        <p><b>Order ID:</b> #${o.id}</p>
        <p><b>Status:</b> ${o.status}</p>
        <p><b>Payment:</b> ${o.paymentStatus}</p>
        <p><b>Date:</b> ${formatDate(o.createdAt)}</p>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((i) => {
                const price = Number(i.price);
                const total = price * i.quantity;
                return `
                  <tr>
                    <td>${i.productName}</td>
                    <td>${i.quantity}</td>
                    <td>₹${price.toFixed(2)}</td>
                    <td>₹${total.toFixed(2)}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>

        <h2 style="margin-top: 20px;">Grand Total: ₹${Number(o.totalAmount).toFixed(2)}</h2>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.print();
  }

  function printPackingSlip() {
    if (!detail) return;

    const o = detail.order;
    const items = detail.items;

    const html = `
      <html>
      <head>
        <title>Packing Slip #${o.id}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { margin: 0; }
          ul { margin-top: 16px; }
          li { padding: 6px 0; }
        </style>
      </head>
      <body>
        <h1>Packing Slip</h1>
        <p><b>Order ID:</b> #${o.id}</p>
        <p><b>Status:</b> ${o.status}</p>
        <p><b>Tracking:</b> ${o.trackingNumber || "Not added"}</p>

        <h3 style="margin-top: 16px;">Items</h3>
        <ul>
          ${items
            .map((i) => `<li>${i.productName} — Qty: ${i.quantity}</li>`)
            .join("")}
        </ul>

        <p style="margin-top: 24px; font-size: 12px; opacity: 0.7;">
          Printed from Orivya Eco Admin Panel
        </p>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.print();
  }

  return (
    <AdminLayout
      title="Orders"
      subtitle="Update status, tracking, payment + print invoices"
    >
      <div className="space-y-8">
        {/* HERO */}
        <div className="rounded-3xl border bg-gradient-to-br from-violet-700 via-fuchsia-700 to-pink-600 text-white p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm w-fit">
              <ShoppingBag className="h-4 w-4" />
              Order Management
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Orders
            </h1>

            <p className="text-white/80 text-sm md:text-base max-w-2xl">
              View orders, update status & payments, add tracking and print invoice
              + packing slip.
            </p>

            <div className="flex flex-wrap gap-2 pt-3">
              <Badge className="bg-white/15 hover:bg-white/15 text-white border-white/10">
                Total: {orders?.length ?? 0}
              </Badge>
              <Badge className="bg-white/15 hover:bg-white/15 text-white border-white/10">
                Showing: {filtered.length}
              </Badge>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <Card className="rounded-3xl shadow-sm border bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Search className="h-4 w-4" />
              Search Orders
            </div>

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, status, payment, tracking..."
              className="rounded-2xl"
            />
          </CardContent>
        </Card>

        {/* ORDER LIST */}
        <Card className="rounded-3xl shadow-sm border bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order List
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Loading orders...</p>
            ) : !filtered.length ? (
              <p className="text-black/60">No orders found.</p>
            ) : (
              <div className="space-y-4">
                {filtered.map((o) => {
                  const Icon = statusIcon(o.status);

                  return (
                    <div
                      key={o.id}
                      className="rounded-3xl border bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold">
                              Order #{o.id}
                            </p>

                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyle(
                                o.status,
                              )}`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {o.status}
                            </span>

                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium capitalize ${paymentStyle(
                                o.paymentStatus || "pending",
                              )}`}
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              {o.paymentStatus || "pending"}
                            </span>
                          </div>

                          <p className="text-sm text-black/60">
                            Total:{" "}
                            <span className="font-semibold text-black">
                              ₹{Number(o.totalAmount).toFixed(2)}
                            </span>
                          </p>

                          <p className="text-sm text-black/60 flex items-center gap-2">
                            <Hash className="h-4 w-4 text-black/40" />
                            Tracking:{" "}
                            <span className="font-medium text-black">
                              {o.trackingNumber || "Not added"}
                            </span>
                          </p>

                          {o.createdAt ? (
                            <p className="text-xs text-black/40">
                              Created: {formatDate(o.createdAt)}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => setSelectedId(o.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* DETAILS PANEL */}
        {selectedId && detail ? (
          <Card className="rounded-3xl shadow-sm border bg-white">
            <CardHeader className="flex flex-col gap-2">
              <CardTitle className="flex items-center justify-between">
                <span>Order Details #{detail.order.id}</span>

                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => setSelectedId(null)}
                >
                  Close
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Order Status</p>
                  <select
                    value={detail.order.status}
                    onChange={(e) =>
                      updateMutation.mutate({
                        id: detail.order.id,
                        status: e.target.value,
                      })
                    }
                    className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
                    disabled={updateMutation.isPending}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Payment Status</p>
                  <select
                    value={detail.order.paymentStatus || "pending"}
                    onChange={(e) =>
                      updateMutation.mutate({
                        id: detail.order.id,
                        paymentStatus: e.target.value,
                      })
                    }
                    className="h-11 rounded-2xl border px-4 text-sm bg-white w-full"
                    disabled={updateMutation.isPending}
                  >
                    {payments.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tracking */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tracking Number</p>
                  <div className="flex gap-2">
                    <Input
                      defaultValue={detail.order.trackingNumber || ""}
                      placeholder="Enter tracking..."
                      className="rounded-2xl"
                      id="trackingInput"
                    />
                    <Button
                      className="rounded-2xl"
                      disabled={updateMutation.isPending}
                      onClick={() => {
                        const el = document.getElementById(
                          "trackingInput",
                        ) as HTMLInputElement;

                        updateMutation.mutate({
                          id: detail.order.id,
                          trackingNumber: el.value,
                        });
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              <div className="space-y-3">
                <p className="font-semibold">Order Items</p>

                <div className="space-y-2">
                  {detail.items.map((i) => (
                    <div
                      key={i.id}
                      className="rounded-2xl border bg-white p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{i.productName}</p>
                        <p className="text-sm text-black/60">
                          Qty: {i.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-black/60">Price</p>
                        <p className="font-semibold">
                          ₹{Number(i.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRINT */}
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-2xl" onClick={printInvoice}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>

                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={printPackingSlip}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Packing Slip
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AdminLayout>
  );
}
