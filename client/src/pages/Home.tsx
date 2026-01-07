import { Layout } from "@/components/Layout";
import { ShinyButton } from "@/components/ui/shiny-button";
import { WaveSeparator } from "@/components/WaveSeparator";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, GraduationCap, PenTool, Award } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-cream overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 bg-wave-pattern opacity-40 pointer-events-none" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6">
              Serving Quality Since 1990
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight text-foreground mb-6">
              Empowering <br />
              <span className="text-primary relative">
                Education
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
              <br />
              Inspiring Minds
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 font-sans leading-relaxed">
              Your one-stop destination for academic books, stationery, and premium educational supplies in Rudauli & Ayodhya.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <ShinyButton className="w-full sm:w-auto h-14 text-lg">
                  Customer Login
                </ShinyButton>
              </Link>
              <ShinyButton variant="outline" className="w-full sm:w-auto h-14 text-lg border-2">
                Browse Collection
              </ShinyButton>
            </div>
          </motion.div>

          {/* Hero Image / Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Using an Unsplash image for the "Premium Stationery/Books" vibe */}
            {/* education books stationery */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80" 
                alt="Books and Stationery" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white text-left">
                <p className="font-bold text-2xl font-display">Premium Collection</p>
                <p className="text-white/80">Everything a student needs</p>
              </div>
            </div>
            
            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-8 -right-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <div className="bg-orange-100 p-2 rounded-full">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-sm">Top Rated</p>
                <p className="text-xs text-muted-foreground">In Rudauli</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <WaveSeparator fill="#ffffff" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground text-lg">We provide more than just books; we provide a future.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BookOpen} 
              title="Vast Collection" 
              desc="From KG to PG, we have course books for all boards and universities." 
              color="bg-blue-50 text-blue-600"
            />
            <FeatureCard 
              icon={PenTool} 
              title="Premium Stationery" 
              desc="High-quality pens, notebooks, and art supplies for creative minds." 
              color="bg-orange-50 text-orange-600"
            />
            <FeatureCard 
              icon={GraduationCap} 
              title="Trusted Since 1990" 
              desc="Three decades of trust and quality service to the student community." 
              color="bg-pink-50 text-pink-600"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <div className="group p-8 rounded-3xl border border-slate-100 hover:border-slate-200 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color} transition-transform group-hover:scale-110 duration-300`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
