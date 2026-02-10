import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/hooks/use-products";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { useState } from "react";

export default function Shop() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;

  const { data: products, isLoading } = useProducts({ category, search });
  const [sortBy, setSortBy] = useState("featured");

  const sortedProducts = products ? [...products].sort((a, b) => {
    if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
    if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
    return 0; // Default or Featured
  }) : [];

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif mb-4 capitalize">
            {category || (search ? `Results for "${search}"` : "All Products")}
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Explore our curated collection of premium essentials designed to elevate your daily ritual.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex gap-2">
            {/* Simple Filter Pills */}
            <Button 
              variant={!category ? "default" : "outline"} 
              size="sm" 
              onClick={() => window.location.href = '/shop'}
            >
              All
            </Button>
            <Button 
              variant={category === "skincare" ? "default" : "outline"} 
              size="sm"
              onClick={() => window.location.href = '/shop?category=skincare'}
            >
              Skincare
            </Button>
            <Button 
              variant={category === "makeup" ? "default" : "outline"} 
              size="sm"
              onClick={() => window.location.href = '/shop?category=makeup'}
            >
              Makeup
            </Button>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>No products found matching your criteria.</p>
            <Button variant="link" onClick={() => window.location.href = '/shop'}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
