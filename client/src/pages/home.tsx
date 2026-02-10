import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, Star, Leaf, ShieldCheck, Truck } from "lucide-react";

export default function Home() {
  const { data: featuredProducts } = useProducts();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Abstract Luxury Background - Unsplash makeup abstract */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"
        >
          <div className="absolute inset-0 bg-black/20" /> {/* Subtle Overlay */}
        </div>

        <div className="relative z-10 text-center text-white space-y-6 max-w-3xl px-4">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block text-sm font-medium tracking-[0.2em] uppercase"
          >
            New Collection 2024
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight"
          >
            Radiance <br /> Redefined
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/shop">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-8 py-6 text-sm tracking-widest font-bold uppercase transition-transform hover:scale-105">
                Shop The Collection
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Curated Categories</h2>
            <div className="w-16 h-0.5 bg-black mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Skincare", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9af908?auto=format&fit=crop&w=800&q=80", link: "/shop?category=skincare" },
              { name: "Makeup", image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&w=800&q=80", link: "/shop?category=makeup" },
              { name: "Gift Sets", image: "https://images.unsplash.com/photo-1611080541599-8c6dbde6edb8?auto=format&fit=crop&w=800&q=80", link: "/shop?category=sets" }
            ].map((cat) => (
              <Link key={cat.name} href={cat.link} className="group relative aspect-[3/4] overflow-hidden cursor-pointer block">
                <img 
                  src={cat.image} 
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl md:text-3xl font-serif italic tracking-wider group-hover:-translate-y-2 transition-transform duration-300">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-2">Best Sellers</h2>
              <p className="text-gray-500">Our most loved products</p>
            </div>
            <Link href="/shop" className="text-sm font-medium uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {(!featuredProducts || featuredProducts.length === 0) && (
               <div className="col-span-full text-center py-20 text-gray-400">
                 Loading premium selection...
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-green-50 text-green-800">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Clean Ingredients</h4>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">100% natural, cruelty-free, and dermatologically tested.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-purple-50 text-purple-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Premium Quality</h4>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Sourced from the finest origins around the world.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-blue-50 text-blue-800">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Fast Delivery</h4>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Free express shipping on orders over $100.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Story */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1556228720-1957be83e144?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif italic">Join the Movement</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            We believe that beauty should be uncompromising. Sustainable, ethical, and effective.
            Discover the new era of luxury cosmetics.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" variant="outline" className="text-black border-white hover:bg-white hover:text-black rounded-none">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
