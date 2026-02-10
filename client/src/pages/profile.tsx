import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Loader2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: orders, isLoading } = useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
    enabled: !!user,
  });

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Role</p>
                  <p className="capitalize text-sm">{user.role}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-xl font-medium mb-4">Order History</h2>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base">Order #{order.id}</CardTitle>
                        <p className="text-xs text-gray-500">
                          Placed on {new Date(order.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${Number(order.totalAmount).toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        } capitalize`}>
                          {order.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Could fetch and show order items here */}
                      <div className="flex items-center text-sm text-gray-500 gap-2">
                        <Package className="w-4 h-4" /> 
                        {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "Processing"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                You haven't placed any orders yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
