import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.orders.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Order creation failed");
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Order Placed!", description: "Thank you for your purchase." });
      clearCart();
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      setLocation("/profile"); // or order confirmation page
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login", description: "You need to be logged in to checkout." });
      setLocation("/auth");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const shippingAddress = {
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zip: formData.get("zip") as string,
      country: formData.get("country") as string,
      phone: formData.get("phone") as string,
    };

    const paymentMethod = formData.get("payment") as "stripe" | "cod";

    createOrderMutation.mutate({
      userId: user.id,
      totalAmount: total(),
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending", // Ideally handle stripe flow
      status: "pending",
      shippingAddress,
      items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-serif mb-8 text-center">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Shipping Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" name="street" required />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" required />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" name="zip" required />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Payment Method</h3>
              <RadioGroup defaultValue="stripe" name="payment">
                <div className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value="stripe" id="r1" />
                  <Label htmlFor="r1">Credit Card (Stripe)</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value="cod" id="r2" />
                  <Label htmlFor="r2">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </div>
          </form>

          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h3 className="font-medium text-lg border-b pb-2 mb-4">Your Order</h3>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-xl pt-4 border-t">
              <span>Total</span>
              <span>${total().toFixed(2)}</span>
            </div>
            
            <Button 
              type="submit" 
              form="checkout-form"
              className="w-full mt-6 rounded-full py-6 text-base"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
