import { Layout } from "@/components/layout";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Are Orivya products safe for sensitive skin?",
    a: "Yes. We focus on clean ingredients and skin-friendly formulas. Always patch test first.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders are delivered within 3–7 working days depending on location.",
  },
  {
    q: "Do you offer returns?",
    a: "Yes. Returns are available as per our Shipping & Returns policy.",
  },
  {
    q: "Can I cancel my order?",
    a: "Orders can be cancelled before they are shipped.",
  },
  {
    q: "Do you ship internationally?",
    a: "Not currently. We will enable international shipping soon.",
  },
];

export default function FAQPage() {
  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-1 text-sm">
                <HelpCircle className="h-4 w-4 text-purple-600" />
                Support
              </p>
              <h1 className="mt-4 text-4xl font-serif font-bold tracking-tight">
                Frequently Asked Questions
              </h1>
              <p className="mt-3 text-black/60">
                Quick answers for common questions.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((f, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border bg-white p-7 shadow-sm"
                >
                  <h3 className="font-semibold text-lg">{f.q}</h3>
                  <p className="mt-2 text-black/60 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border bg-gradient-to-br from-purple-600 to-fuchsia-600 p-10 text-white shadow-xl">
              <h3 className="text-xl font-semibold">Still need help?</h3>
              <p className="mt-2 text-white/80">
                Go to Contact page and send us a message.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
