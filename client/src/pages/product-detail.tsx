import { Layout } from "@/components/layout";
import { useProduct } from "@/hooks/use-products";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, Minus, Plus, Share2 } from "lucide-react";
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = Number(params?.id);
  const { data: product, isLoading } = useProduct(id);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your bag.`,
    });
  };

  const imageUrl = product.images?.[0] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1000";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm">
              <img 
                src={imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Small thumbnails could go here */}
          </div>

          {/* Product Info */}
          <div className="flex flex-col h-full py-4">
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium tracking-widest text-gray-500 uppercase">
                  {product.categoryId === 1 ? "Skincare" : "Beauty"}
                </span>
                <Button variant="ghost" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-serif font-medium leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-gray-500">(124 Reviews)</span>
              </div>

              <div className="text-2xl font-mono">
                ${Number(product.price).toFixed(2)}
              </div>

              <p className="text-gray-600 leading-relaxed max-w-md">
                {product.description}
              </p>
            </div>

            <div className="space-y-6 mt-auto">
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-gray-200 rounded-full px-3 py-2">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:text-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 hover:text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  size="lg" 
                  className="flex-1 rounded-full text-base tracking-wide py-6"
                >
                  Add to Cart - ${(Number(product.price) * quantity).toFixed(2)}
                </Button>
              </div>

              <div className="border-t pt-8">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="ingredients">
                    <AccordionTrigger>Ingredients</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Aqua (Water), Glycerin, Niacinamide, Hyaluronic Acid, Aloe Barbadensis Leaf Extract...
                        (Full list on packaging)
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="usage">
                    <AccordionTrigger>How to Use</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Apply a small amount to clean skin morning and night. Massage gently until absorbed.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shipping">
                    <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Free shipping on orders over $100. Returns accepted within 30 days of purchase if unopened.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
