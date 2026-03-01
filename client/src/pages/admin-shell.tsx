import { Switch, Route, useLocation } from "wouter";
import AdminLayout from "@/pages/admin-layout";
import { useAuth } from "@/hooks/use-auth";

// Admin pages
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProducts from "@/pages/admin-products";
import AdminOrders from "@/pages/admin-orders";
import AdminCustomers from "@/pages/admin-customers";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminWarehouse from "@/pages/admin-warehouse";
import AdminPrint from "@/pages/admin-print";
import AdminStaff from "@/pages/admin-staff";
import AdminSettings from "@/pages/admin-settings";

function pageMeta(path: string) {
  if (path === "/admin") return { title: "Dashboard", subtitle: "Overview & quick stats" };
  if (path === "/admin/products") return { title: "Products", subtitle: "Manage products, stock, combos & pricing" };
  if (path === "/admin/orders") return { title: "Orders", subtitle: "Track orders, status, payments & printing" };
  if (path === "/admin/customers") return { title: "Customers", subtitle: "Customer list and profiles" };
  if (path === "/admin/analytics") return { title: "Analytics", subtitle: "Sales insights & performance reports" };
  if (path === "/admin/warehouse") return { title: "Warehouse", subtitle: "Stock, inventory and logistics" };
  if (path === "/admin/print") return { title: "Print Center", subtitle: "Print stickers, barcodes & QR codes" };
  if (path === "/admin/staff") return { title: "Staff", subtitle: "Manage staff accounts and roles" };
  if (path === "/admin/settings") return { title: "Settings", subtitle: "Store settings & configurations" };
  return { title: "Admin", subtitle: "Admin panel" };
}

export default function AdminShell() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  const isAdmin = !!user && user.role !== "customer";

  // Hard protection
  if (!isLoading && !isAdmin) {
    setTimeout(() => setLocation("/auth"), 10);
    return null;
  }

  const meta = pageMeta(location);

  return (
    <AdminLayout title={meta.title} subtitle={meta.subtitle}>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/warehouse" component={AdminWarehouse} />
        <Route path="/admin/print" component={AdminPrint} />
        <Route path="/admin/staff" component={AdminStaff} />
        <Route path="/admin/settings" component={AdminSettings} />
      </Switch>
    </AdminLayout>
  );
}
