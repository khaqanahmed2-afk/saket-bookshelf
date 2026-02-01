
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { products, categories } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export default function Shop() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <SEO
                title="Shop Books & Stationery | Saket Pustak Kendra, Rudauli"
                description="Browse our wide collection of books, stationery, school supplies & office essentials in Rudauli, Ayodhya. NCERT books, exam prep materials, art supplies. Order via WhatsApp: +91 77540 57200"
                keywords="buy books Rudauli, stationery shop Ayodhya, school supplies near me, NCERT books, exam preparation, notebooks Rudauli, pens, art supplies, geometry box, water bottles Ayodhya"
                canonical="https://saketpustakkendra.in/shop"
            />
            <Layout>
                <div className="bg-slate-50 min-h-screen pb-20">

                    {/* Banner */}
                    <div className="bg-gradient-to-r from-pink-100 to-blue-100 py-16 text-center shadow-sm">
                        <div className="container mx-auto px-4">
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-3">
                                Stationery Store
                            </h1>
                            <p className="text-slate-600 max-w-lg mx-auto">
                                Explore our premium collection of books, pens, and office essentials.
                            </p>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="container mx-auto px-4 -mt-6">
                        <Card className="border-none shadow-md bg-white mb-8">
                            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">

                                {/* Mobile Horizontal Scroll Filters */}
                                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                                    {categories.map((cat, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Search items..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Product Grid */}
                    <div className="container mx-auto px-4">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <h3 className="text-xl font-bold text-slate-500">No products found</h3>
                                <p className="text-slate-400">Try adjusting your search or filter</p>
                            </div>
                        )}

                        {filteredProducts.length > 0 && (
                            <div className="mt-12 text-center text-slate-400 text-sm">
                                Showing {filteredProducts.length} products
                            </div>
                        )}
                    </div>

                </div>

                {/* BreadcrumbList Schema for SEO */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://saketpustakkendra.in/"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Shop",
                                "item": "https://saketpustakkendra.in/shop"
                            }
                        ]
                    })
                }}></script>
            </Layout>
        </>
    );
}
