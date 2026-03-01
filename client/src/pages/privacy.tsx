import { Layout } from "@/components/layout";

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-14 max-w-4xl">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-center">
            Privacy Policy
          </h1>

          <div className="mt-10 rounded-3xl border bg-white p-8 shadow-sm space-y-5 text-black/70 leading-relaxed">
            <p>
              Orivya Eco Pvt. Ltd. respects your privacy. This policy explains
              what information we collect and how we use it.
            </p>

            <h2 className="text-xl font-semibold text-black">Information</h2>
            <p>
              We collect basic details such as your name, email, shipping
              address, and order history to fulfill purchases and improve your
              experience.
            </p>

            <h2 className="text-xl font-semibold text-black">Payments</h2>
            <p>
              Payment processing is handled securely by payment gateways. We do
              not store card details on our servers.
            </p>

            <h2 className="text-xl font-semibold text-black">Security</h2>
            <p>
              We use standard security practices to protect user accounts and
              order information.
            </p>

            <h2 className="text-xl font-semibold text-black">Contact</h2>
            <p>
              If you have questions about privacy, email us at
              support@orivyaeco.com.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
