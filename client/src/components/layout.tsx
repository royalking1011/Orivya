import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Search, Menu, X, LogOut, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string) || "";
    const clean = q.trim();
    if (clean) setLocation(`/shop?search=${encodeURIComponent(clean)}`);
    setIsSearchOpen(false);
  };

  const isAdmin = !!user && user.role !== "customer";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      {/* Announcement Bar */}
      <div className="bg-black text-white text-[10px] sm:text-xs py-2 text-center uppercase tracking-widest font-medium">
        Free shipping on all orders over $100
      </div>

      {/* Header */}
      <motion.header
        initial={false}
        animate={{
          boxShadow: scrolled
            ? "0 10px 30px rgba(0,0,0,0.06)"
            : "0 0px 0px rgba(0,0,0,0)",
        }}
        className="sticky top-0 z-50 w-full bg-white/75 backdrop-blur-md border-b border-gray-100"
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-10">
                  <nav className="flex flex-col gap-4 text-lg font-serif">
                    <Link href="/" className="flex items-center gap-2">
                      <Home className="h-5 w-5" /> Home
                    </Link>
                    <Link href="/shop" className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" /> Shop
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-5 w-5" /> Profile
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-serif font-bold tracking-tighter"
          >
            ORIVYA
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">
              HOME
            </Link>
            <Link href="/shop" className="hover:text-black transition-colors">
              SHOP
            </Link>
            <Link href="/profile" className="hover:text-black transition-colors">
              PROFILE
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent"
              onClick={() => setIsSearchOpen((v) => !v)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile & Orders</Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={async () => {
                      await logout();
                      setLocation("/auth");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">
                    {items.length}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full bg-white/90 backdrop-blur border-b border-gray-100 p-4"
            >
              <form
                onSubmit={handleSearch}
                className="container mx-auto flex gap-2 max-w-2xl"
              >
                <Input
                  name="q"
                  placeholder="Search for products..."
                  className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200"
                  autoFocus
                />
                <Button type="submit">Search</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white py-16 mt-10">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="font-serif text-xl">ORIVYA</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Luxury sustainable cosmetics designed to bring out your natural
              radiance. Clean ingredients, premium quality.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium tracking-wide">SHOP</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/shop?category=skincare">Skincare</Link>
              <Link href="/shop?category=makeup">Makeup</Link>
              <Link href="/shop">New Arrivals</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium tracking-wide">SUPPORT</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/contact">Contact Us</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium tracking-wide">NEWSLETTER</h4>
            <p className="text-sm text-gray-400">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-white/10 border-transparent text-white placeholder:text-gray-500 focus:bg-white/20"
              />
              <Button variant="secondary">Join</Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Orivya Eco Private Limited. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
