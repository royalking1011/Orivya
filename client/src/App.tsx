import { Switch, Route, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";

import HomePage from "@/pages/home";
import ShopPage from "@/pages/shop";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import ProductDetailPage from "@/pages/product-detail";
import ProfilePage from "@/pages/profile";
import NotFoundPage from "@/pages/not-found";
import AuthPage from "@/pages/auth";

// ADMIN
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProducts from "@/pages/admin-products";
import AdminOrders from "@/pages/admin-orders";
import AdminCustomers from "@/pages/admin-customers";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminWarehouse from "@/pages/admin-warehouse";
import AdminPrint from "@/pages/admin-print";
import AdminStaff from "@/pages/admin-staff";
import AdminSettings from "@/pages/admin-settings";

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location} className="w-full">
        <Switch>
          {/* PUBLIC */}
          <Route path="/">
            <Page>
              <HomePage />
            </Page>
          </Route>

          <Route path="/shop">
            <Page>
              <ShopPage />
            </Page>
          </Route>

          <Route path="/cart">
            <Page>
              <CartPage />
            </Page>
          </Route>

          <Route path="/checkout">
            <Page>
              <CheckoutPage />
            </Page>
          </Route>

          <Route path="/product/:id">
            <Page>
              <ProductDetailPage />
            </Page>
          </Route>

          <Route path="/profile">
            <Page>
              <ProfilePage />
            </Page>
          </Route>

          <Route path="/auth">
            <Page>
              <AuthPage />
            </Page>
          </Route>

          {/* ADMIN */}
          <Route path="/admin">
            <Page>
              <AdminDashboard />
            </Page>
          </Route>

          <Route path="/admin/products">
            <Page>
              <AdminProducts />
            </Page>
          </Route>

          <Route path="/admin/orders">
            <Page>
              <AdminOrders />
            </Page>
          </Route>

          <Route path="/admin/customers">
            <Page>
              <AdminCustomers />
            </Page>
          </Route>

          <Route path="/admin/analytics">
            <Page>
              <AdminAnalytics />
            </Page>
          </Route>

          <Route path="/admin/warehouse">
            <Page>
              <AdminWarehouse />
            </Page>
          </Route>

          <Route path="/admin/print">
            <Page>
              <AdminPrint />
            </Page>
          </Route>

          <Route path="/admin/staff">
            <Page>
              <AdminStaff />
            </Page>
          </Route>

          <Route path="/admin/settings">
            <Page>
              <AdminSettings />
            </Page>
          </Route>

          {/* 404 */}
          <Route>
            <Page>
              <NotFoundPage />
            </Page>
          </Route>
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}
