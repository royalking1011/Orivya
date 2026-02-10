import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  ShoppingBag,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: analytics } = useQuery({
    queryKey: [api.analytics.get.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.get.path);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.analytics.get.responses[200].parse(await res.json());
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path);
      if (!res.ok) throw new Error("Failed");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });

  if (!user || !user.role.includes("admin")) {
    setLocation("/auth");
    return null;
  }

  // Mock data for chart
  const data = [
    { name: 'Jan', total: 4000 },
    { name: 'Feb', total: 3000 },
    { name: 'Mar', total: 2000 },
    { name: 'Apr', total: 2780 },
    { name: 'May', total: 1890 },
    { name: 'Jun', total: 2390 },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6 hidden md:flex flex-col">
        <div className="text-2xl font-serif font-bold mb-10 tracking-tighter">ORIVYA ADMIN</div>
        
        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-white/10" asChild>
            <Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10" asChild>
            <Link href="/admin/products"><Package className="mr-2 h-4 w-4" /> Products</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10" asChild>
            <Link href="/admin/orders"><ShoppingBag className="mr-2 h-4 w-4" /> Orders</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10" asChild>
            <Link href="/admin/customers"><Users className="mr-2 h-4 w-4" /> Customers</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10" asChild>
            <Link href="/admin/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
          </Button>
        </nav>

        <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <div className="text-sm text-gray-500">Welcome back, {user.name}</div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="text-green-500 font-bold">$</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.totalSales?.toLocaleString() ?? "0"}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{analytics?.totalOrders ?? 0}</div>
              <p className="text-xs text-muted-foreground">+180.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{analytics?.totalCustomers ?? 0}</div>
              <p className="text-xs text-muted-foreground">+19% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#000000" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                You made {recentOrders?.length ?? 0} sales this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders?.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 capitalize">
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">${Number(order.totalAmount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {!recentOrders?.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
