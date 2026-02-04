import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, LogOut, User, LayoutDashboard, Menu, Home, Package, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ShinyButton } from "./ui/shiny-button";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/bulk-orders", label: "Bulk Orders", icon: Package },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    ...(user ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      {/* Header - safe-area padding for notch devices */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/5 bg-secondary/80 backdrop-blur-xl transition-all pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 h-14 min-h-[44px] flex items-center justify-between">
          <Link href="/">
            <Logo textSize="text-xl md:text-2xl" />
          </Link>

          {/* Mobile: Hamburger menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl border-primary/10 bg-white hover:bg-primary/5">
                  <Menu className="h-5 w-5 text-slate-700" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(320px,100vw)] pt-[env(safe-area-inset-top)]">
                <SheetHeader>
                  <SheetTitle className="text-left font-display">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-8">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-left font-medium text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                        {label}
                      </button>
                    </Link>
                  ))}
                  {!user ? (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-left font-medium bg-primary text-white hover:bg-primary/90 transition-colors mt-2">
                        <User className="h-5 w-5" />
                        Login
                      </button>
                    </Link>
                  ) : (
                    <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-left font-medium text-red-600 hover:bg-red-50 transition-colors mt-2">
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/bulk-orders" className={`${location === '/bulk-orders' ? 'text-primary font-bold bg-primary/5' : 'text-slate-600 hover:text-primary hover:bg-slate-50'} inline-flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300 mr-2`}>
              Bulk Orders
            </Link>
            <Link href="/shop" className={`${location === '/shop' ? 'text-primary font-bold bg-primary/5' : 'text-slate-500 hover:text-primary hover:bg-white'} inline-flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300`}>
              Shop
            </Link>

            {user ? (
              <div className="flex items-center gap-3 md:gap-4">
                <Link href="/dashboard" className={location === '/dashboard' ? 'text-primary font-bold bg-primary/5 inline-flex items-center px-4 py-2 rounded-full text-sm' : 'text-slate-500 hover:text-primary hover:bg-white inline-flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300'}>
                  Dashboard
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 md:px-3 rounded-full border border-primary/10 bg-white hover:bg-primary/5 transition-all shadow-sm hover:shadow-md group min-h-[44px]">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium hidden sm:inline text-slate-700">{user.email?.split('@')[0] || 'User'}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-primary/10 shadow-xl shadow-primary/5 rounded-2xl p-2 bg-white/95 backdrop-blur-sm">
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-xl px-4 py-3 my-1 font-medium transition-colors min-h-[44px]">
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={signOut} className="text-red-500 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer rounded-xl px-4 py-3 my-1 font-medium transition-colors min-h-[44px]">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <ShinyButton variant="primary" className="px-6 py-2 h-11 min-h-[44px] text-sm bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl">
                  Login
                </ShinyButton>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - safe-area for home indicator */}
      <footer className="bg-white border-t border-border py-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-4">
                <Logo textSize="text-lg" />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Serving quality education since 1990. Your trusted partner for books, stationery, and educational resources in Rudauli & Ayodhya.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://share.google/aWPN36et2TcQjLdAo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    📍 Saket Pustak Kendra, Rudauli, Ayodhya – 224120, UP
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/917754057200"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    📞 WhatsApp: +91 77540 57200
                  </a>
                </li>
                <li>GST: 09AFQPR5141C1ZA</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Customer Login</Link></li>
                <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Import</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Saket Pustak Kendra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
