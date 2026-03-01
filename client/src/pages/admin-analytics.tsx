import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/pages/admin-layout";

import {
  BarChart3,
  IndianRupee,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AnalyticsResponse = {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  monthlySales: { name: string; total: number }[];
  weeklyOrders: { name: string; orders: number }[];
};

function formatINR(value: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
  }
}

export default function AdminAnalytics() {
  const { data, isLoading, isError, refetch, isFetching } =
    useQuery<AnalyticsResponse>({
      queryKey: ["/api/admin/analytics"],
      retry: false,
    });

  const monthly = useMemo(() => data?.monthlySales || [], [data]);
  const weekly = useMemo(() => data?.weeklyOrders || [], [data]);

  return (
    <AdminLayout
      title="Analytics"
      subtitle="Track revenue, orders, customers and trends"
    >
      <div className="space-y-8">
        {/* HERO */}
        <div className="rounded-3xl border bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm w-fit">
              <BarChart3 className="h-4 w-4" />
              Business Intelligence
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Store Analytics
            </h1>

            <p className="text-white/70 text-sm md:text-base max-w-2xl">
              Live store performance from your database — revenue, orders,
              customers, monthly sales and weekly activity.
            </p>

            <div className="flex flex-wrap gap-2 pt-3">
              <Badge className="bg-white/10 hover:bg-white/10 text-white">
                System: Live
              </Badge>
              <Badge className="bg-white/10 hover:bg-white/10 text-white">
                Currency: INR
              </Badge>
            </div>

            <div className="pt-4">
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? "Refreshing..." : "Refresh Analytics"}
              </Button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {isError ? (
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardContent className="p-6">
              <p className="font-semibold text-lg">Analytics failed to load</p>
              <p className="text-sm text-black/60 mt-1">
                Check your backend route: <b>/api/admin/analytics</b> and ensure
                you are logged in as admin.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-black/60 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {isLoading ? "—" : formatINR(data?.totalSales || 0)}
              </div>
              <p className="text-xs text-black/50 mt-2">
                Real data from orders table
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-black/60 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {isLoading ? "—" : data?.totalOrders ?? 0}
              </div>
              <p className="text-xs text-black/50 mt-2">
                Total orders placed
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-black/60 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {isLoading ? "—" : data?.totalCustomers ?? 0}
              </div>
              <p className="text-xs text-black/50 mt-2">
                Registered customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Sales */}
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Sales (Last 12 Months)
              </CardTitle>
              <p className="text-sm text-black/60">
                Revenue trend month-by-month
              </p>
            </CardHeader>

            <CardContent>
              <div className="h-[320px]">
                {isLoading ? (
                  <p className="text-black/60">Loading chart...</p>
                ) : monthly.length === 0 ? (
                  <p className="text-black/60">No monthly data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="total"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Orders */}
          <Card className="rounded-3xl border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Weekly Orders (Last 7 Days)
              </CardTitle>
              <p className="text-sm text-black/60">
                Orders trend for the last week
              </p>
            </CardHeader>

            <CardContent>
              <div className="h-[320px]">
                {isLoading ? (
                  <p className="text-black/60">Loading chart...</p>
                ) : weekly.length === 0 ? (
                  <p className="text-black/60">No weekly data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
