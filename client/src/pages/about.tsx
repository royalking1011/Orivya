import { Layout } from "@/components/layout";
import { Sparkles, Leaf, ShieldCheck, HeartHandshake } from "lucide-react";

export default function AboutPage() {
  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
        {/* HERO */}
        <div className="relative overflow-hidden border-b bg-white/70 backdrop-blur">
          <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="container mx-auto px-4 py-16 relative">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-4 py-1 text-sm">
                <Sparkles className="h-4 w-4 text-fuchsia-600" />
                Our Story
              </p>

              <h1 className="mt-5 text-4xl md:text-5xl font-serif font-bold tracking-tight">
                Orivya Eco — Premium Beauty, Clean & Sustainable
              </h1>

              <p className="mt-4 text-black/60 text-base md:text-lg leading-relaxed">
                We are building a modern luxury cosmetics brand where elegance
                meets clean ingredients. Our mission is simple: create products
                that feel premium, work beautifully, and stay safe for your skin.
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <Leaf className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Eco-first mindset</h2>
              </div>
              <p className="mt-3 text-black/60 leading-relaxed">
                Our packaging and product decisions are designed to reduce waste
                while keeping the premium feel.
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-fuchsia-600" />
                <h2 className="text-xl font-semibold">Clean & safe</h2>
              </div>
              <p className="mt-3 text-black/60 leading-relaxed">
                We focus on formulas that are gentle and effective. Every product
                is designed for real results.
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Luxury feel</h2>
              </div>
              <p className="mt-3 text-black/60 leading-relaxed">
                Orivya is designed to feel premium — from product texture to
                packaging, branding, and experience.
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-6 w-6 text-fuchsia-600" />
                <h2 className="text-xl font-semibold">Customer obsession</h2>
              </div>
              <p className="mt-3 text-black/60 leading-relaxed">
                We believe the best brands are built with trust. Your experience
                is our priority.
              </p>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="mt-12 rounded-3xl border bg-gradient-to-br from-purple-600 to-fuchsia-600 p-10 text-white shadow-xl">
            <h3 className="text-2xl font-serif font-bold">
              The future of beauty is clean.
            </h3>
            <p className="mt-2 text-white/80 max-w-2xl">
              Orivya Eco is not just cosmetics — it’s a premium experience built
              for modern customers.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
