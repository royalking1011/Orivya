import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import AdminLayout from "@/pages/admin-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Settings,
  Save,
  Store,
  Truck,
  ShieldCheck,
  IndianRupee,
  Bell,
  RefreshCcw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type SettingRow = {
  id: number;
  key: string;
  value: any;
};

function toStr(v: any) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  return String(v);
}

export default function AdminSettings() {
  const { toast } = useToast();

  // -------------------------
  // Load Settings from backend
  // -------------------------
  const { data, isLoading } = useQuery<SettingRow[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
    retry: false,
  });

  // Convert array -> map
  const map = useMemo(() => {
    const m: Record<string, any> = {};
    (data || []).forEach((s) => {
      m[s.key] = s.value;
    });
    return m;
  }, [data]);

  // -------------------------
  // Local state (editable)
  // -------------------------
  const [storeName, setStoreName] = useState("Orivya Eco");
  const [supportEmail, setSupportEmail] = useState("support@orivyaeco.com");
  const [supportPhone, setSupportPhone] = useState("+91 00000 00000");

  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [shippingFlat, setShippingFlat] = useState("0");
  const [freeShippingAbove, setFreeShippingAbove] = useState("100");

  const [enableCOD, setEnableCOD] = useState(true);
  const [enableOnlinePayments, setEnableOnlinePayments] = useState(false);

  const [enableEmailNotifications, setEnableEmailNotifications] = useState(false);
  const [enableOrderUpdates, setEnableOrderUpdates] = useState(true);

  // Load from backend -> local state
  useEffect(() => {
    if (!data) return;

    setStoreName(toStr(map.storeName) || "Orivya Eco");
    setSupportEmail(toStr(map.supportEmail) || "support@orivyaeco.com");
    setSupportPhone(toStr(map.supportPhone) || "+91 00000 00000");

    setCurrencySymbol(toStr(map.currencySymbol) || "₹");
    setShippingFlat(toStr(map.shippingFlat) || "0");
    setFreeShippingAbove(toStr(map.freeShippingAbove) || "100");

    setEnableCOD(map.enableCOD !== undefined ? Boolean(map.enableCOD) : true);
    setEnableOnlinePayments(
      map.enableOnlinePayments !== undefined ? Boolean(map.enableOnlinePayments) : false,
    );

    setEnableEmailNotifications(
      map.enableEmailNotifications !== undefined ? Boolean(map.enableEmailNotifications) : false,
    );
    setEnableOrderUpdates(
      map.enableOrderUpdates !== undefined ? Boolean(map.enableOrderUpdates) : true,
    );
  }, [data, map]);

  // -------------------------
  // Save mutation
  // -------------------------
  const saveMutation = useMutation({
    mutationFn: async (payload: { key: string; value: any }) => {
      return apiRequest("PATCH", "/api/admin/settings", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
  });

  async function saveAll() {
    try {
      const list = [
        { key: "storeName", value: storeName },
        { key: "supportEmail", value: supportEmail },
        { key: "supportPhone", value: supportPhone },

        { key: "currencySymbol", value: currencySymbol },
        { key: "shippingFlat", value: shippingFlat },
        { key: "freeShippingAbove", value: freeShippingAbove },

        { key: "enableCOD", value: enableCOD },
        { key: "enableOnlinePayments", value: enableOnlinePayments },

        { key: "enableEmailNotifications", value: enableEmailNotifications },
        { key: "enableOrderUpdates", value: enableOrderUpdates },
      ];

      for (const item of list) {
        await saveMutation.mutateAsync(item);
      }

      toast({
        title: "Settings saved",
        description: "All settings were updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to save settings",
        description: err?.message || "Check backend route.",
        variant: "destructive",
      });
    }
  }

  function resetDefaults() {
    setStoreName("Orivya Eco");
    setSupportEmail("support@orivyaeco.com");
    setSupportPhone("+91 00000 00000");

    setCurrencySymbol("₹");
    setShippingFlat("0");
    setFreeShippingAbove("100");

    setEnableCOD(true);
    setEnableOnlinePayments(false);

    setEnableEmailNotifications(false);
    setEnableOrderUpdates(true);

    toast({
      title: "Reset done",
      description: "Defaults loaded. Click Save to apply.",
    });
  }

  return (
    <AdminLayout
      title="Settings"
      subtitle="Control store, shipping, payments, and notifications"
    >
      <div className="space-y-8">
        {/* HERO */}
        <div className="rounded-3xl border bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm w-fit">
              <Settings className="h-4 w-4" />
              Admin Settings
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Store Configuration
            </h1>

            <p className="text-white/70 text-sm md:text-base max-w-2xl">
              Update store details, shipping rules, payment options and order
              notifications.
            </p>

            <div className="flex flex-wrap gap-3 pt-3">
              <Button
                className="rounded-2xl"
                onClick={saveAll}
                disabled={saveMutation.isPending || isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save All Settings"}
              </Button>

              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={resetDefaults}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Reset Defaults
              </Button>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {isLoading ? (
          <Card className="rounded-3xl">
            <CardContent className="p-6 text-black/60">
              Loading settings...
            </CardContent>
          </Card>
        ) : null}

        {/* SETTINGS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* STORE */}
          <Card className="rounded-3xl shadow-sm border bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Info
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Support Phone</Label>
                <Input
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* SHIPPING */}
          <Card className="rounded-3xl shadow-sm border bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Currency Symbol</Label>
                <Input
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Flat Shipping Charge</Label>
                <div className="relative">
                  <IndianRupee className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                  <Input
                    value={shippingFlat}
                    onChange={(e) => setShippingFlat(e.target.value)}
                    className="rounded-2xl pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Free Shipping Above</Label>
                <div className="relative">
                  <IndianRupee className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                  <Input
                    value={freeShippingAbove}
                    onChange={(e) => setFreeShippingAbove(e.target.value)}
                    className="rounded-2xl pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PAYMENTS */}
          <Card className="rounded-3xl shadow-sm border bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Payments
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Cash on Delivery (COD)</p>
                  <p className="text-sm text-black/60">
                    Enable COD checkout option.
                  </p>
                </div>
                <Switch checked={enableCOD} onCheckedChange={setEnableCOD} />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Online Payments</p>
                  <p className="text-sm text-black/60">
                    Enable Razorpay/Stripe later.
                  </p>
                </div>
                <Switch
                  checked={enableOnlinePayments}
                  onCheckedChange={setEnableOnlinePayments}
                />
              </div>
            </CardContent>
          </Card>

          {/* NOTIFICATIONS */}
          <Card className="rounded-3xl shadow-sm border bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-black/60">
                    Enable email notifications (future).
                  </p>
                </div>
                <Switch
                  checked={enableEmailNotifications}
                  onCheckedChange={setEnableEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-black/60">
                    Auto status updates & logs.
                  </p>
                </div>
                <Switch
                  checked={enableOrderUpdates}
                  onCheckedChange={setEnableOrderUpdates}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FOOT NOTE */}
        <Card className="rounded-3xl border bg-white">
          <CardContent className="p-6 text-sm text-black/60 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings are stored in your database table: <b>settings</b>.
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
