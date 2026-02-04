import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ShinyButton } from "@/components/ui/shiny-button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, GraduationCap, PenTool, Users, Building, Truck, CheckCircle, Package, ReceiptText, FileDown, CreditCard, ShieldCheck, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Home() {
  const bestSellers = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <>
      <SEO
        title="Bulk Stationery Supplier Ayodhya | Wholesale for Schools"
        description="Saket Pustak Kendra: Ayodhya's leading wholesale stationery supplier since 1990. Bulk orders for schools, offices & coaching centers. Call: 7754057200"
        keywords="bulk stationery supplier Ayodhya, wholesale stationery dealer, school stationery bulk order, office stationery supplier, stationery wholesaler Rudauli, Saket Pustak Kendra"
        canonical="https://saketpustakkendra.in/"
      />
      <Layout>
        {/* 1. BULK/WHOLESALE HERO SECTION */}
        <section className="relative bg-gradient-to-br from-[#1e293b] to-[#0f172a] min-h-[550px] lg:min-h-[650px] flex items-center overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/30 blur-3xl"></div>
            <div className="absolute top-40 -left-20 w-[400px] h-[400px] rounded-full bg-accent/20 blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left text-white"
            >
              <div className="inline-block bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-orange-400 font-bold mr-2">⚡ WHOLESALE</span>
                <span className="text-sm font-medium tracking-wide">SUPPLIER IN AYODHYA</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-tight mb-6 text-white">
                Bulk Stationery <br />
                <span className="text-white">
                  For Schools & Offices
                </span>
              </h1>

              <p className="text-slate-300 text-lg md:text-xl mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Trusted by 200+ schools, coaching centers & offices since 1990.
                Premium quality, wholesale pricing, and same-day delivery in Ayodhya.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/bulk-orders">
                  <div className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/25 cursor-pointer transition-all hover:scale-105 flex items-center justify-center gap-2">
                    <Package className="w-5 h-5" />
                    Get Bulk Quote
                  </div>
                </Link>
                <a
                  href="https://wa.me/917754057200?text=Hi, I need a bulk stationery quote for my organization"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-bold backdrop-blur-sm cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  WhatsApp Order
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-6 opacity-80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">35+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">200+ Bulk Clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Fast Local Delivery</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-lg">
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <GraduationCap className="text-orange-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800">For Schools</h3>
                    <p className="text-xs text-slate-500 mt-1">Notebooks, Exam copies, Chalks & Kits</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg mt-8">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Building className="text-blue-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800">For Offices</h3>
                    <p className="text-xs text-slate-500 mt-1">Files, Paper, Registers & Supplies</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg -mt-8">
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <BookOpen className="text-purple-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800">Institutes</h3>
                    <p className="text-xs text-slate-500 mt-1">Study material, Whiteboards & Markers</p>
                  </div>
                  <div className="bg-primary p-4 rounded-2xl shadow-lg text-white">
                    <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Package className="text-white w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white">Bulk Deal</h3>
                    <p className="text-xs text-white/80 mt-1">Get up to 40% OFF on bulk orders</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 1.5 ALREADY OUR CUSTOMER SECTION */}
        <section className="py-20 relative z-20 -mt-10 mb-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-primary/5 border border-primary/5 relative overflow-hidden"
            >
              {/* Trust Pattern Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full mb-6 font-bold text-sm tracking-wide">
                    <ShieldCheck className="w-4 h-4" />
                    SECURE CUSTOMER PORTAL
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-slate-800 mb-6 leading-tight">
                    Already Our Customer?
                  </h2>
                  <p className="text-slate-600 text-lg mb-8 max-w-lg leading-relaxed font-medium">
                    Access your personalized dashboard to manage your stationery needs and track financial history instantly.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/login">
                      <div className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-2xl text-xl font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-3 group">
                        Login with Mobile
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                  <p className="mt-4 text-slate-400 text-sm font-bold flex items-center justify-center lg:justify-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Secure PIN-based mobile login
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <ReceiptText className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-black text-slate-800 mb-2">Digital Ledger</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      View your real-time balance and detailed transaction history 24x7.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <FileDown className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-black text-slate-800 mb-2">PDF Invoices</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Download digital copies of your bills and statements anytime.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group lg:col-span-2">
                    <div className="flex items-center gap-4">
                      <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <CreditCard className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800">Track Payments</h3>
                        <p className="text-sm text-slate-500 font-medium italic mt-0.5">
                          View receipts and historical payment status in one tap.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. WHO WE SERVE SECTION */}
        <section className="py-20 bg-white relative z-20 -mt-10 rounded-t-[3rem]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">Who We Serve</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 mt-2">
                Wholesale Solutions For Everyone
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Schools */}
              <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-slate-100 group">
                <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Schools & Colleges</h3>
                <ul className="space-y-3 mb-8 text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Bulk notebook supply</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Exam answer sheets</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Teachers' registers</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Annual contracts</li>
                </ul>
                <a href="https://wa.me/917754057200?text=I need a bulk quote for School Stationery" target="_blank" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                  Get School Quote <span className="text-xl">→</span>
                </a>
              </div>

              {/* Card 2: Offices */}
              <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-slate-100 group">
                <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Offices & Corporates</h3>
                <ul className="space-y-3 mb-8 text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Files & Folders</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Printing Paper (A4/A3)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Desktop essentials</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Monthly supply</li>
                </ul>
                <a href="https://wa.me/917754057200?text=I need a bulk quote for Office Stationery" target="_blank" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                  Get Office Quote <span className="text-xl">→</span>
                </a>
              </div>

              {/* Card 3: Coaching Centers */}
              <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-slate-100 group">
                <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Coaching Institutes</h3>
                <ul className="space-y-3 mb-8 text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Student kits</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Whiteboard markers</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Competitive exam books</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> OMR sheets</li>
                </ul>
                <a href="https://wa.me/917754057200?text=I need a bulk quote for Coaching Institute" target="_blank" className="text-purple-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                  Get Institute Quote <span className="text-xl">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BEST SELLERS GRID */}
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

        {/* 3.5 SMART AI ORDER ASSISTANT (COMING SOON) */}
        <section className="py-20 bg-gradient-to-r from-indigo-900 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10 text-center text-white">
            {/* Coming Soon Badge with Animation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <span className="font-bold tracking-widest text-sm text-orange-300 uppercase">🚀 Coming Soon</span>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Smart AI Order Assistant
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Effortlessly place orders by simply speaking or typing your list.
              Our AI understands "50 Classmate Notebooks and 20 Blue Pens" instantly!
            </p>

            {/* Demo Visual (Static for now) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-3xl mx-auto backdrop-blur-sm mb-10">
              <div className="flex gap-4 items-start text-left mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">👤</div>
                <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none max-w-lg">
                  <p className="text-slate-200">I need 100 registers for my office and 5 boxes of A4 paper.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start text-left flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl">🤖</div>
                <div className="bg-indigo-600/30 border border-indigo-500/30 p-4 rounded-2xl rounded-tr-none max-w-lg">
                  <p className="text-indigo-200 text-sm font-bold mb-2">Creating Order...</p>
                  <ul className="space-y-1 text-white text-sm">
                    <li>✅ 100x Office Registers (Rough)</li>
                    <li>✅ 5x A4 Paper Boxes (JK Copier)</li>
                  </ul>
                  <div className="mt-3 inline-block text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Estimated Total: ₹6,500</div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="flex justify-center">
              <a
                href="https://wa.me/917754057200?text=Hi, I want to try the AI ordering feature"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <button className="relative px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-2xl flex items-center gap-3 transition-all transform group-hover:-translate-y-1">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  Order on WhatsApp
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* 4. SHOP BY CATEGORY */}
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

        {/* 5. WHY CHOOSE SAKET PUSTAK KENDRA */}
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
                      Serving quality education for over 35 years with dedication and trust
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Point 2 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Wholesale Pricing</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Best bulk rates for schools, offices, and large orders in Ayodhya
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Point 3 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Truck className="w-7 h-7 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Fast Local Delivery</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Same-day delivery service available in Rudauli & Ayodhya
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Point 4 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Genuine Products</h3>
                    <p className="text-slate-600 leading-relaxed">
                      100% authentic books and stationery from authorized brands
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TESTIMONIAL */}
        <section className="py-24 bg-white text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Testimonial</h2>
            <h3 className="text-3xl font-display font-bold text-slate-800 mb-8">What Our Customer Says</h3>

            <div className="bg-[#fffbeb] p-8 rounded-[2rem] relative">
              <div className="text-4xl text-orange-300 absolute -top-4 left-8">"</div>
              <p className="text-slate-600 italic text-lg mb-6 leading-relaxed">
                "Saket Pustak Kendra has been our school's trusted supplier for 5 years. Their bulk pricing is unbeatable and delivery is always on time for the new academic session."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-slate-300 flex items-center justify-center font-bold text-slate-500">PK</div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Principal, Kids Public School</p>
                  <p className="text-xs text-slate-500">Rudauli, Ayodhya</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FINAL CALL TO ACTION */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary/90 to-accent">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 md:mb-6">
                Ready to Order in Bulk?
              </h2>
              <p className="text-lg md:text-xl mb-8 md:mb-10 opacity-90 leading-relaxed max-w-2xl mx-auto">
                Get the best wholesale rates for your school, office, or institute.
                Contact us today for a custom quote.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/bulk-orders">
                  <ShinyButton className="w-full sm:w-auto bg-white hover:bg-white/90 text-primary px-8 py-4 h-auto rounded-2xl text-lg font-bold shadow-xl border-none">
                    Get Bulk Quote
                  </ShinyButton>
                </Link>
                <a href="https://wa.me/917754057200" target="_blank" className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-bold transition-all text-center">
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQ Section - Optimized for Featured Snippets */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800">Frequently Asked Questions</h2>

            <div className="max-w-3xl mx-auto space-y-6">
              <details className="border-b border-slate-200 pb-4 group" open>
                <summary className="font-semibold text-lg cursor-pointer text-slate-800 hover:text-primary transition-colors flex justify-between items-center py-4">
                  Do you offer wholesale prices for schools and offices?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed pl-4">
                  Yes! We specialize in bulk orders for schools, coaching centers, and offices. We offer special wholesale tiered pricing for orders above 100 units. <Link href="/bulk-orders" className="text-primary hover:underline">Click here to get a bulk quote</Link>.
                </p>
              </details>

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
                  What is the minimum order quantity for wholesale rates?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed pl-4">
                  Our wholesale pricing typically starts at orders of 50+ units for notebooks or ₹5,000+ total order value. However, we customize packages for schools and offices of all sizes. Contact us for details.
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

        <WhatsAppButton />
      </Layout>
    </>
  );
}
