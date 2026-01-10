import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, LogOut, User, LayoutDashboard, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ShinyButton } from "./ui/shiny-button";
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
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Saket Pustak Kendra
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/admin" className={location === '/admin' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}>
              Admin
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className={location === '/dashboard' ? 'text-primary font-medium hidden md:block' : 'text-muted-foreground hover:text-foreground hidden md:block'}>
                  Dashboard
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white hover:bg-slate-50 transition-colors">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium hidden sm:inline">{user.email || user.phone || user.mobile || 'User'}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Admin Import</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <ShinyButton variant="primary" className="px-6 py-2 text-sm">
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
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-lg">Saket Pustak Kendra</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Serving quality education since 1990. Your trusted partner for books, stationery, and educational resources in Rudauli & Ayodhya.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Rudauli, Ayodhya – 224120, UP</li>
                <li>Mobile: 7754057200</li>
                <li>GST: 09AFQPR5141C1ZA</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Customer Login</Link></li>
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
