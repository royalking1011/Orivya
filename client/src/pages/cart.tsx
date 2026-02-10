import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
          <h2 className="text-3xl font-serif">Your Bag is Empty</h2>
          <p className="text-gray-500 mb-4">Looks like you haven't added anything yet.</p>
          <Link href="/shop">
            <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-serif mb-12 text-center">Your Shopping Bag</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                layout
                className="flex gap-4 md:gap-6 p-4 bg-white border border-gray-100 rounded-lg shadow-sm"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={item.images?.[0] || ""} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500">${Number(item.price).toFixed(2)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-full px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="font-medium">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
              <h3 className="text-xl font-serif mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total().toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full rounded-full py-6 text-base" size="lg">
                  Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                Secure Checkout - 30 Day Returns
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
