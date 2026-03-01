import { Layout } from "@/components/layout";

export default function TermsPage() {
  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-14 max-w-4xl">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-center">
            Terms & Conditions
          </h1>

          <div className="mt-10 rounded-3xl border bg-white p-8 shadow-sm space-y-5 text-black/70 leading-relaxed">
            <p>
              By using Orivya Eco website, you agree to the following terms.
            </p>

            <h2 className="text-xl font-semibold text-black">Orders</h2>
            <p>
              Orders may be cancelled before shipment. Once shipped, cancellation
              is not guaranteed.
            </p>

            <h2 className="text-xl font-semibold text-black">Pricing</h2>
            <p>
              Prices may change without notice. Discounts and offers are time
              limited.
            </p>

            <h2 className="text-xl font-semibold text-black">Liability</h2>
            <p>
              Orivya Eco is not responsible for misuse of products. Always read
              labels and patch test.
            </p>

            <h2 className="text-xl font-semibold text-black">Contact</h2>
            <p>
              For questions, contact us at support@orivyaeco.com.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
