import { Link } from "wouter";
import { type Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your bag.`,
    });
  };

  // Safe fallback for images
  const imageUrl = product.images?.[0] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600";

  return (
    <Link href={`/product/${product.id}`} className="group cursor-pointer">
      <div className="space-y-4">
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-sm">
          {product.isCombo && (
            <div className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] px-2 py-1 uppercase tracking-wider font-medium">
              Bundle
            </div>
          )}
          
          <motion.img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            whileHover={{ scale: 1.05 }}
          />

          {/* Quick Add Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-white/90 text-black hover:bg-white backdrop-blur-sm shadow-sm font-medium tracking-wide"
            >
              <Plus className="w-4 h-4 mr-2" /> Add to Cart
            </Button>
          </div>
        </div>

        <div className="space-y-1 text-center group-hover:opacity-80 transition-opacity">
          <h3 className="font-serif text-lg text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
          <p className="font-medium font-mono text-sm mt-2">${Number(product.price).toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}
