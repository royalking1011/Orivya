import { Layout } from "@/components/layout";
import { Truck, RefreshCcw } from "lucide-react";

export default function ShippingPage() {
  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-14 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold tracking-tight">
              Shipping & Returns
            </h1>
            <p className="mt-3 text-black/60">
              Transparent policies to keep everything simple.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Shipping</h2>
              </div>

              <ul className="mt-4 space-y-2 text-black/60 leading-relaxed">
                <li>• Orders are processed within 24–48 hours.</li>
                <li>• Delivery time: 3–7 working days.</li>
                <li>• Free shipping above a minimum cart value (if enabled).</li>
              </ul>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <RefreshCcw className="h-6 w-6 text-fuchsia-600" />
                <h2 className="text-xl font-semibold">Returns</h2>
              </div>

              <ul className="mt-4 space-y-2 text-black/60 leading-relaxed">
                <li>• Returns accepted only for damaged or wrong items.</li>
                <li>• Return request must be raised within 48 hours.</li>
                <li>• Refunds processed within 5–7 working days.</li>
              </ul>
            </div>

            <div className="rounded-3xl border bg-gradient-to-br from-purple-600 to-fuchsia-600 p-10 text-white shadow-xl">
              <h3 className="text-xl font-semibold">Need help?</h3>
              <p className="mt-2 text-white/80">
                Contact our support team anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
