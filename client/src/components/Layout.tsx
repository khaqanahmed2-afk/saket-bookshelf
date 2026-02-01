
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ShinyButton } from "./ui/shiny-button";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/5 bg-secondary/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo textSize="text-xl md:text-2xl" />
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/shop" className={`${location === '/shop' ? 'text-primary font-bold bg-primary/5' : 'text-slate-500 hover:text-primary hover:bg-white'} hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300`}>
              Shop
            </Link>

            {user ? (
              <div className="flex items-center gap-3 md:gap-4">
                <Link href="/dashboard" className={location === '/dashboard' ? 'text-primary font-bold bg-primary/5 hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm' : 'text-slate-500 hover:text-primary hover:bg-white hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300'}>
                  Dashboard
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 md:px-3 rounded-full border border-primary/10 bg-white hover:bg-primary/5 transition-all shadow-sm hover:shadow-md group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium hidden sm:inline text-slate-700">{user.email?.split('@')[0] || 'User'}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-primary/10 shadow-xl shadow-primary/5 rounded-2xl p-2 bg-white/95 backdrop-blur-sm">
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-xl px-4 py-3 my-1 font-medium transition-colors">
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={signOut} className="text-red-500 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer rounded-xl px-4 py-3 my-1 font-medium transition-colors">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <ShinyButton variant="primary" className="px-6 py-2 h-10 text-sm bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl">
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

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12">
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
