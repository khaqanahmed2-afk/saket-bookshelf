import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ShinyButton } from "@/components/ui/shiny-button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, GraduationCap, PenTool, Users, Building } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export default function Home() {
  const bestSellers = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <>
      <SEO
        title="Saket Pustak Kendra | Books & Stationery in Rudauli, Ayodhya ⭐4.5"
        description="Your trusted bookstore since 1990 in Rudauli, Ayodhya. Premium NCERT books, competitive exam materials, school supplies & office stationery. Google Rating: 4.5★ | WhatsApp: +91 77540 57200"
        keywords="bookstore Rudauli, stationery shop Ayodhya, NCERT books Rudauli, competitive exam books, school supplies Ayodhya, Saket Pustak Kendra, books near me, stationery wholesaler Rudauli"
        canonical="https://saketpustakkendra.in/"
      />
      <Layout>
        {/* 1. MINT HERO SECTION (Reference Match) */}
        <section className="relative bg-[#a8d5c8] min-h-[500px] lg:min-h-[600px] flex items-center overflow-hidden">
          {/* Decorative Doodles */}
          <div className="absolute top-12 left-12 opacity-50 text-white transform -rotate-12">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2"><path d="M50 0 L61 35 L97 35 L68 57 L79 91 L50 69 L21 91 L32 57 L3 35 L39 35 Z" /></svg>
          </div>
          <div className="absolute bottom-12 right-1/3 opacity-50 text-white transform rotate-45">
            <div className="w-4 h-4 rounded-full bg-white/40 mb-2"></div>
            <div className="w-2 h-2 rounded-full bg-white/40 ml-4"></div>
          </div>

          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left text-white"
            >
              <p className="text-sm md:text-base font-medium tracking-widest uppercase mb-4 opacity-90">Inspired by Sakura</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-8">
                Furukawashiko <br /> Flake Stickers
              </h1>
              <ShinyButton className="bg-[#fb923c] hover:bg-[#f97316] text-white px-8 py-3 h-auto rounded-full text-base font-bold shadow-none border-none">
                Shop Now
              </ShinyButton>
            </motion.div>

            {/* Right Image Composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Main Circle BG */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-none" />

              {/* Floating Sticker Packs (Mockup using Unsplash for now, simulating the reference) */}
              <div className="relative z-10 transform rotate-3">
                <img
                  src="https://images.unsplash.com/photo-1576502200272-341a4b8d5e0a?q=80&w=800&auto=format&fit=crop"
                  alt="Stationery Flake Stickers"
                  className="rounded-3xl shadow-xl w-[400px] mx-auto border-4 border-white/50"
                />
                {/* Floating Elements mimicking the reference layout */}
                <div className="absolute -top-10 -right-10 bg-white p-2 rounded-xl shadow-lg transform rotate-12">
                  <img src="https://images.unsplash.com/photo-1615486511269-e3e9d8e578fa?w=100" alt="Colorful stationery stickers" className="w-16 h-16 rounded-lg object-cover" loading="lazy" />
                </div>
                <div className="absolute -bottom-5 -left-5 bg-white p-2 rounded-xl shadow-lg transform -rotate-6">
                  <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=100" alt="Cute stationery items" className="w-16 h-16 rounded-lg object-cover" loading="lazy" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. BEST SELLERS GRID */}
        <section className="py-20 bg-cream">
          <div className="container mx-auto px-4 pointer-events-none">
            <div className="flex justify-between items-end mb-10 pointer-events-auto">
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-800">Best Sellers</h2>
                <div className="h-1 w-20 bg-primary/30 mt-2 rounded-full"></div>
              </div>
              <Link href="/shop" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer pointer-events-auto z-50">View all</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pointer-events-auto">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* 3. NEW ARRIVALS GRID */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-800">New Arrival</h2>
                <div className="h-1 w-20 bg-orange-200 mt-2 rounded-full"></div>
              </div>
              <Link href="/shop" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">View all</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. SHOP BY BRANDS */}
        <section className="py-16 bg-cream border-t border-slate-100">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-10">Shop By Brands</h3>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-700"><BookOpen className="w-8 h-8" /> BOOK SHOP</div>
              <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-700"><GraduationCap className="w-8 h-8" /> Education</div>
              <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-700"><Users className="w-8 h-8" /> KIDS EDU</div>
              <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-700"><PenTool className="w-8 h-8" /> STATIONERY</div>
              <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-700"><Building className="w-8 h-8" /> STATIONERY</div>
            </div>
          </div>
        </section>

        {/* 5. TESTIMONIAL */}
        <section className="py-24 bg-white text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Testimonial</h2>
            <h3 className="text-3xl font-display font-bold text-slate-800 mb-8">What Our Customer Says</h3>

            <div className="bg-[#fffbeb] p-8 rounded-[2rem] relative">
              <div className="text-4xl text-orange-300 absolute -top-4 left-8">"</div>
              <p className="text-slate-600 italic text-lg mb-6 leading-relaxed">
                "Saket Bookshelf has totally transformed my study desk! The sticker packs and notebooks are so cute and high quality. Shipping was super fast too. Highly recommended for stationery lovers!"
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Customer testimonial - Sarah Jenkins" loading="lazy" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Sarah Jenkins</p>
                  <p className="text-xs text-slate-500">Student</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SMART AI ORDER ASSISTANT (COMING SOON) - DEMO ONLY */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                🚀 COMING SOON
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 mb-3">
                Smart AI Order Assistant
              </h2>
              <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto">
                Order your favorite stationery using natural language - just like chatting with a friend!
              </p>
            </div>

            {/* Chat-style Demo Interface */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-primary/10">
              <div className="space-y-4 mb-6">
                {/* Customer Message (Left) */}
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-5 py-3 max-w-[85%] md:max-w-[70%]">
                    <p className="text-slate-800 text-base md:text-lg">
                      "Natraj pencil ke 2 packet chahiye"
                    </p>
                  </div>
                </div>

                {/* AI Response (Right) */}
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-5 py-4 max-w-[85%] md:max-w-[70%]">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">✔</span>
                      <p className="font-bold text-base">Order Noted</p>
                    </div>
                    <div className="space-y-1 text-sm md:text-base pl-6">
                      <p><span className="opacity-80">Item:</span> Natraj Pencil</p>
                      <p><span className="opacity-80">Quantity:</span> 2 Packets</p>
                      <p><span className="opacity-80">Status:</span> Will be sent to WhatsApp</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-orange-500 text-xl flex-shrink-0">⚠</span>
                <p className="text-orange-800 text-sm md:text-base leading-relaxed">
                  This is a demo preview only. AI ordering coming soon to make your shopping experience even easier!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. ALREADY OUR CUSTOMER? - LOGIN CTA */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 md:p-12 border border-primary/20 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Content */}
                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 mb-4">
                    Already Our Customer?
                  </h2>
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
                    Access your digital ledger, download bills, and track your payments seamlessly through our customer portal.
                  </p>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-sm">✓</span>
                      </div>
                      <p className="text-slate-700 font-medium">View detailed ledger</p>
                    </div>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-sm">✓</span>
                      </div>
                      <p className="text-slate-700 font-medium">Download PDF bills instantly</p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href="/login">
                    <ShinyButton className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 h-auto rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 border-none">
                      Login with Mobile
                    </ShinyButton>
                  </Link>
                </div>

                {/* Right Visual */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 bg-white rounded-3xl shadow-xl flex items-center justify-center transform rotate-6">
                      <BookOpen className="w-20 h-20 text-primary" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-2xl shadow-lg flex items-center justify-center transform -rotate-12">
                      <PenTool className="w-12 h-12 text-accent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. WHY CHOOSE SAKET PUSTAK KENDRA */}
        <section className="py-16 md:py-24 bg-cream">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 mb-3">
                Why Choose Saket Pustak Kendra
              </h2>
              <div className="h-1 w-24 bg-primary/30 mt-3 rounded-full mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Trust Point 1 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Building className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Trusted Since 1990</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Serving quality education for over 30 years with dedication and trust
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Point 2 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Genuine Products</h3>
                    <p className="text-slate-600 leading-relaxed">
                      100% authentic books and stationery from trusted brands
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Point 3 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Affordable Pricing</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Best prices for students and competitive exam aspirants
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Point 4 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Local & Trusted</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Your neighborhood shop in Rudauli & Ayodhya
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. SHOP BY CATEGORY */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 mb-3">
                Shop by Category
              </h2>
              <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
                Find exactly what you need for your educational journey
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {/* Category 1: School Books */}
              <Link href="/shop">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-all cursor-pointer group">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg mb-1">School Books</h3>
                  <p className="text-sm text-slate-600">All classes</p>
                </div>
              </Link>

              {/* Category 2: Competitive Exam Books */}
              <Link href="/shop">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-all cursor-pointer group">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg mb-1">Competitive Exams</h3>
                  <p className="text-sm text-slate-600">UPSC, SSC, Railway</p>
                </div>
              </Link>

              {/* Category 3: Stationery */}
              <Link href="/shop">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-all cursor-pointer group">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PenTool className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg mb-1">Stationery</h3>
                  <p className="text-sm text-slate-600">Pens, pencils & more</p>
                </div>
              </Link>

              {/* Category 4: Kids Education */}
              <Link href="/shop">
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-all cursor-pointer group">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 md:w-10 md:h-10 text-pink-500" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg mb-1">Kids Education</h3>
                  <p className="text-sm text-slate-600">Activity books</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 10. FINAL CALL TO ACTION */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary/90 to-accent">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 md:mb-6">
                Your Trusted Book & Stationery Partner
              </h2>
              <p className="text-lg md:text-xl mb-8 md:mb-10 opacity-90 leading-relaxed max-w-2xl mx-auto">
                Order books and stationery easily from Saket Pustak Kendra. Quality products, trusted service since 1990.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/shop">
                  <ShinyButton className="w-full sm:w-auto bg-white hover:bg-white/90 text-primary px-8 py-4 h-auto rounded-2xl text-lg font-bold shadow-xl border-none">
                    Shop Now
                  </ShinyButton>
                </Link>
                <Link href="/login">
                  <button className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-bold transition-all">
                    Login with Mobile
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Optimized for Featured Snippets */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800">Frequently Asked Questions</h2>

            <div className="max-w-3xl mx-auto space-y-6">
              <details className="border-b border-slate-200 pb-4 group">
                <summary className="font-semibold text-lg cursor-pointer text-slate-800 hover:text-primary transition-colors flex justify-between items-center py-4">
                  Do you deliver NCERT books in Rudauli and Ayodhya?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed pl-4">
                  Yes! We deliver NCERT books for all classes (1-12) in Rudauli, Ayodhya, and nearby areas. You can easily order via WhatsApp at <a href="https://wa.me/917754057200" className="text-primary font-semibold hover:underline">+91 77540 57200</a>. We also have them available in-store for immediate pickup.
                </p>
              </details>

              <details className="border-b border-slate-200 pb-4 group">
                <summary className="font-semibold text-lg cursor-pointer text-slate-800 hover:text-primary transition-colors flex justify-between items-center py-4">
                  What are your shop timings?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed pl-4">
                  We are open <strong>Monday to Saturday from 9:00 AM to 8:00 PM</strong>, and <strong>Sunday from 10:00 AM to 6:00 PM</strong>. Visit us at Saket Pustak Kendra, Rudauli, Ayodhya - 224120, UP.
                </p>
              </details>

              <details className="border-b border-slate-200 pb-4 group">
                <summary className="font-semibold text-lg cursor-pointer text-slate-800 hover:text-primary transition-colors flex justify-between items-center py-4">
                  Do you have competitive exam preparation books?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed pl-4">
                  Absolutely! We stock a comprehensive range of competitive exam books including SSC, UPSC, Banking, Railway, State PSC, and various other government exam preparation materials. Contact us on WhatsApp to check availability of specific titles.
                </p>
              </details>

              <details className="border-b border-slate-200 pb-4 group">
                <summary className="font-semibold text-lg cursor-pointer text-slate-800 hover:text-primary transition-colors flex justify-between items-center py-4">
                  Can I order school stationery in bulk for institutions?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed pl-4">
                  Yes! We offer <strong>wholesale rates for bulk orders</strong> from schools, coaching centers, and institutions. Contact us on WhatsApp at +91 77540 57200 for special pricing and quotes on bulk stationery orders.
                </p>
              </details>

              <details className="border-b border-slate-200 pb-4 group">
                <summary className="font-semibold text-lg cursor-pointer text-slate-800 hover:text-primary transition-colors flex justify-between items-center py-4">
                  What payment methods do you accept?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed pl-4">
                  We accept Cash, UPI, and Bank Transfer for your convenience. Both in-store and delivery orders can be paid using any of these methods.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* FAQ Schema Markup */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Do you deliver NCERT books in Rudauli and Ayodhya?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We deliver NCERT books for all classes (1-12) in Rudauli, Ayodhya, and nearby areas. You can easily order via WhatsApp at +91 77540 57200."
                }
              },
              {
                "@type": "Question",
                "name": "What are your shop timings?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We are open Monday to Saturday from 9:00 AM to 8:00 PM, and Sunday from 10:00 AM to 6:00 PM."
                }
              },
              {
                "@type": "Question",
                "name": "Do you have competitive exam preparation books?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We stock a comprehensive range of competitive exam books including SSC, UPSC, Banking, Railway, State PSC, and various other government exam preparation materials."
                }
              },
              {
                "@type": "Question",
                "name": "Can I order school stationery in bulk for institutions?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We offer wholesale rates for bulk orders from schools, coaching centers, and institutions. Contact us on WhatsApp at +91 77540 57200 for special pricing."
                }
              },
              {
                "@type": "Question",
                "name": "What payment methods do you accept?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We accept Cash, UPI, and Bank Transfer for your convenience."
                }
              }
            ]
          })
        }}></script>

      </Layout>
    </>
  );


}


