
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BulkOrderForm } from "@/components/BulkOrderForm";
import { BulkOrdersSchema } from "@/components/BulkOrdersSchema";
import { CheckCircle, Truck, Package, GraduationCap, Building, BookOpen, Star, Phone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function BulkOrders() {
    return (
        <>
            <SEO
                title="Wholesale Stationery Supplier in Ayodhya | Bulk Orders for Schools"
                description="Ayodhya's #1 Wholesale Stationery Supplier. Bulk orders for schools, offices & coaching centers. Notebooks, pens, exam supplies at wholesale rates. Same-day delivery."
                keywords="wholesale stationery Ayodhya, bulk stationery supplier, school stationery wholesale, exam copies manufacturer, office supplies bulk, Saket Pustak Kendra bulk"
                canonical="https://saketpustakkendra.in/bulk-orders"
            />
            <BulkOrdersSchema />
            <Layout>
                {/* 1. HERO SECTION */}
                <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 lg:py-28 overflow-hidden text-white">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm font-bold tracking-wide uppercase">Trusted by 200+ Institutions</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
                                    Wholesale Stationery <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
                                        Bulk Order Supplier
                                    </span>
                                </h1>

                                <p className="text-slate-300 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
                                    Get premium school and office stationery at the best wholesale rates in Ayodhya & Rudauli.
                                    Save up to 40% on bulk notebook, pen, and paper orders.
                                </p>

                                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-300 mb-8">
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                        <CheckCircle className="w-4 h-4 text-green-400" /> 35+ Years Experience
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                        <Truck className="w-4 h-4 text-blue-400" /> Same-Day Delivery
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                        <ShieldCheck className="w-4 h-4 text-orange-400" /> GST Invoice
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <a href="#inquiry-form" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer">
                                        Request Wholesale Quote
                                    </a>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="hidden lg:block relative"
                            >
                                <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        <Package className="text-orange-400" /> Popular Bulk Items
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold">NB</div>
                                                <div>
                                                    <p className="font-bold">Notebooks (172pg)</p>
                                                    <p className="text-xs text-slate-400">Classmate / Local</p>
                                                </div>
                                            </div>
                                            <span className="text-green-400 font-bold text-sm bg-green-400/10 px-2 py-1 rounded">Wholesale Rates</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold">A4</div>
                                                <div>
                                                    <p className="font-bold">A4 Paper (75 GSM)</p>
                                                    <p className="text-xs text-slate-400">JK / Trident</p>
                                                </div>
                                            </div>
                                            <span className="text-green-400 font-bold text-sm bg-green-400/10 px-2 py-1 rounded">Carton Price</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold">PN</div>
                                                <div>
                                                    <p className="font-bold">Use & Throw Pens</p>
                                                    <p className="text-xs text-slate-400">Packet of 50</p>
                                                </div>
                                            </div>
                                            <span className="text-green-400 font-bold text-sm bg-green-400/10 px-2 py-1 rounded">Bulk Deal</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-slate-400">
                                        * Prices depend on total quantity
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 2. WHO WE SUPLLY */}
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800">
                                Bulk Supply Solutions For
                            </h2>
                            <div className="h-1 w-20 bg-primary/30 mt-3 rounded-full mx-auto"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Schools */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all">
                                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                    <GraduationCap className="w-7 h-7 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Schools & Colleges</h3>
                                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                    Complete range of student notebooks, exam copies, chalks, registers, and teacher supplies delivered before the session starts.
                                </p>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Exam Answer Sheets
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Student Diary/Almanac
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Annual Contracts
                                    </div>
                                </div>
                            </div>

                            {/* Offices */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all">
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                    <Building className="w-7 h-7 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Corporate Offices</h3>
                                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                    Reliable monthly supply of A4 paper, files, folders, printer cartridges, and desk essentials for smooth office operations.
                                </p>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Printing Paper (JK/Trident)
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Box Files & Folders
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Monthly Billing
                                    </div>
                                </div>
                            </div>

                            {/* Coaching */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all">
                                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                    <BookOpen className="w-7 h-7 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Coaching Centers</h3>
                                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                    Study materials, OMR sheets, whiteboards, markers, and student kits for competitive exam institutes.
                                </p>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Bulk Student Kits
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> OMR Sheets
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Competitive Books
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. PRICING TEASER */}
                <section className="py-20 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center mb-10">
                            <span className="text-primary font-bold tracking-widest uppercase text-sm">Transparent Pricing</span>
                            <h2 className="text-3xl font-display font-bold text-slate-800 mt-2">Sample Wholesale Rates</h2>
                            <p className="text-slate-500 mt-2">The more you order, the more you save!</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                            <div className="grid grid-cols-4 bg-slate-50 p-4 font-bold text-slate-700 text-sm md:text-base">
                                <div className="col-span-2">Product</div>
                                <div className="text-center">Min Qty</div>
                                <div className="text-right">Estimate</div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                <div className="grid grid-cols-4 p-4 text-sm md:text-base hover:bg-slate-50 transition-colors">
                                    <div className="col-span-2 font-medium">Notebooks (Soft cover, 172pg)</div>
                                    <div className="text-center text-slate-500">100 pcs</div>
                                    <div className="text-right font-bold text-green-600">Save ~15%</div>
                                </div>
                                <div className="grid grid-cols-4 p-4 text-sm md:text-base hover:bg-slate-50 transition-colors">
                                    <div className="col-span-2 font-medium">Use & Throw Pens (Blue/Black)</div>
                                    <div className="text-center text-slate-500">1000 pcs</div>
                                    <div className="text-right font-bold text-green-600">Save ~25%</div>
                                </div>
                                <div className="grid grid-cols-4 p-4 text-sm md:text-base hover:bg-slate-50 transition-colors">
                                    <div className="col-span-2 font-medium">A4 Copier Paper (75 GSM)</div>
                                    <div className="text-center text-slate-500">10 Boxes</div>
                                    <div className="text-right font-bold text-green-600">Dealer Price</div>
                                </div>
                                <div className="grid grid-cols-4 p-4 text-sm md:text-base hover:bg-slate-50 transition-colors">
                                    <div className="col-span-2 font-medium">Exam Answer Sheets</div>
                                    <div className="text-center text-slate-500">500 pcs</div>
                                    <div className="text-right font-bold text-green-600">Factory Rate</div>
                                </div>
                            </div>

                            <div className="p-4 bg-orange-50 text-orange-800 text-xs md:text-sm text-center font-medium">
                                * Prices vary based on brand, paper quality, and current market rates. Contact for exact quote.
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. INQUIRY SECTION */}
                <section id="inquiry-form" className="py-20 lg:py-28 bg-white">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                            {/* Left: Contact Info */}
                            <div>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 mb-6">
                                    Request a Bulk Quote
                                </h2>
                                <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                                    Fill out the form to get an instant price estimate for your requirement.
                                    Our team will contact you within 2 hours.
                                </p>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">Call Us Directly</h3>
                                            <p className="text-slate-600 mb-1">Speak to our bulk order manager</p>
                                            <a href="tel:+917754057200" className="text-xl font-bold text-primary hover:underline">+91 77540 57200</a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Truck className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">Visit Our Warehouse Store</h3>
                                            <p className="text-slate-600 mb-1">Saket Pustak Kendra</p>
                                            <p className="text-slate-600">Rudauli, Ayodhya - 224120</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-slate-800 mb-2">Why Order from Us?</h4>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-center gap-2">✅ GST compliant billing available</li>
                                        <li className="flex items-center gap-2">✅ Doorstep delivery in Ayodhya district</li>
                                        <li className="flex items-center gap-2">✅ Return/Exchange for damaged goods</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right: Form */}
                            <div>
                                <BulkOrderForm />
                            </div>
                        </div>
                    </div>
                </section>

                <WhatsAppButton />
            </Layout>
        </>
    );
}
