import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Truck,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

type PaymentMethod = "cod" | "online";

function formatMoney(v: number) {
  return `₹${v.toFixed(2)}`;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [isPlacing, setIsPlacing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  }, [items]);

  const shippingFee = subtotal >= 999 ? 0 : items.length ? 49 : 0;
  const total = subtotal + shippingFee;

  const canPlace =
    items.length > 0 &&
    fullName.trim().length >= 2 &&
    phone.trim().length >= 8 &&
    address.trim().length >= 5 &&
    city.trim().length >= 2 &&
    state.trim().length >= 2 &&
    pincode.trim().length >= 4;

  async function placeOrder() {
    if (!canPlace) {
      toast({
        title: "Please fill all required details",
        description: "Your address & phone are required to place the order.",
        variant: "destructive",
      });
      return;
    }

    setIsPlacing(true);

    try {
      const payload = {
        paymentMethod,
        shippingAddress: {
          fullName,
          phone,
          address,
          city,
          state,
          pincode,
        },
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: "Login required",
            description: "Please login before checkout.",
            variant: "destructive",
          });
          setLocation("/auth");
          return;
        }

        const msg = await res.json().catch(() => null);
        throw new Error(msg?.message || "Failed to place order");
      }

      const order = await res.json();

      clearCart();

      toast({
        title: "Order placed successfully 🎉",
        description: `Order #${order.id} created.`,
      });

      setLocation("/profile");
    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-10">
          {/* HEADER */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 text-xs font-medium text-black/70 backdrop-blur">
              <ShoppingBag className="h-4 w-4" />
              Secure Checkout
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              Checkout
            </h1>
            <p className="mt-2 text-sm text-black/60 max-w-2xl">
              Choose payment method, enter shipping address and place your order.
            </p>
          </div>

          {/* EMPTY CART */}
          {!items.length ? (
            <Card className="rounded-3xl border bg-white shadow-sm">
              <CardContent className="p-10 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 mx-auto text-black/40" />
                <p className="text-lg font-semibold">Your cart is empty</p>
                <p className="text-sm text-black/60">
                  Add products to cart before checkout.
                </p>
                <Button
                  className="rounded-2xl"
                  onClick={() => setLocation("/shop")}
                >
                  Go to Shop
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: FORM */}
              <div className="lg:col-span-2 space-y-6">
                {/* SHIPPING */}
                <Card className="rounded-3xl border bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Details
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <User className="h-4 w-4 text-black/50" />
                          Full Name
                        </Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your name"
                          className="rounded-2xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-black/50" />
                          Phone Number
                        </Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter phone number"
                          className="rounded-2xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House, street, landmark"
                        className="rounded-2xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="rounded-2xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          className="rounded-2xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Pincode</Label>
                        <Input
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="Pincode"
                          className="rounded-2xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PAYMENT */}
                <Card className="rounded-3xl border bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 space-y-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={cn(
                        "w-full rounded-3xl border p-5 text-left transition",
                        paymentMethod === "cod"
                          ? "border-black bg-black text-white"
                          : "bg-white hover:bg-black/5",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Cash on Delivery (COD)
                          </p>
                          <p
                            className={cn(
                              "text-sm mt-1",
                              paymentMethod === "cod"
                                ? "text-white/70"
                                : "text-black/60",
                            )}
                          >
                            Pay when the product is delivered.
                          </p>
                        </div>
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border",
                            paymentMethod === "cod"
                              ? "border-white bg-white"
                              : "border-black/20",
                          )}
                        />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={cn(
                        "w-full rounded-3xl border p-5 text-left transition",
                        paymentMethod === "online"
                          ? "border-black bg-black text-white"
                          : "bg-white hover:bg-black/5",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Online Payment
                          </p>
                          <p
                            className={cn(
                              "text-sm mt-1",
                              paymentMethod === "online"
                                ? "text-white/70"
                                : "text-black/60",
                            )}
                          >
                            Coming soon (Razorpay / UPI / Cards).
                          </p>
                        </div>
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border",
                            paymentMethod === "online"
                              ? "border-white bg-white"
                              : "border-black/20",
                          )}
                        />
                      </div>
                    </button>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT: SUMMARY */}
              <div className="space-y-6">
                <Card className="rounded-3xl border bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      {items.map((i) => (
                        <div
                          key={i.id}
                          className="flex items-start justify-between gap-4"
                        >
                          <div>
                            <p className="font-medium">{i.name}</p>
                            <p className="text-xs text-black/60">
                              Qty: {i.quantity}
                            </p>
                          </div>

                          <p className="font-semibold">
                            {formatMoney(Number(i.price) * i.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-black/10" />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-black/60">Subtotal</span>
                        <span className="font-medium">
                          {formatMoney(subtotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-black/60">Shipping</span>
                        <span className="font-medium">
                          {shippingFee === 0
                            ? "Free"
                            : formatMoney(shippingFee)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-base">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">
                          {formatMoney(total)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full rounded-2xl"
                      disabled={!canPlace || isPlacing}
                      onClick={placeOrder}
                    >
                      {isPlacing ? "Placing Order..." : "Place Order"}
                    </Button>

                    {!canPlace ? (
                      <p className="text-xs text-black/50">
                        Fill all shipping details to enable checkout.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
