export interface Product {
    id: number;
    name: string;
    category: string;
    image: string;
}

export const categories = [
    "All",
    "School Essentials",
    "Office Stationery",
    "Art & Craft",
    "Exam Books",
    "Eco-Friendly Products"
];

// Professional Product Images with White/Light Backgrounds
const CATEGORY_IMAGES: Record<string, string[]> = {
    "School Essentials": [
        "/images/products/blue_notebook.png", // 1. Premium Notebook – Blue Color
        "/images/products/lunch_box_large.png", // 2. Classmate Lunch Box – Large Size
        "/images/products/red_notebook.png", // 3. Doms Notebook – Red Color
        "/images/products/water_bottles_pack.png", // 4. Disney Themed Water Bottle – Pack of 6
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80&fit=crop", // 5. Durable Water Bottle – Medium
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", // 6. Premium School Bag – Red Color
        "https://images.unsplash.com/photo-1635351619921-1bb552d45ab3?w=400&q=80&fit=crop", // 7. Spiral Binding Geometry Box – Medium
        "https://images.unsplash.com/photo-1606312619070-d48b7065e994?w=400&q=80", // 8. Classmate Lunch Box – with Compartments
    ],
    "Office Stationery": [
        "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80", // Pen
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80", // Paper
        "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80", // Sticky Notes
        "https://images.unsplash.com/photo-1595180637172-e64db8b80fc8?w=400&q=80", // Markers
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&q=80", // Desk
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80", // Laptop/Work
        "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5763?w=400&q=80", // Organizer
    ],
    "Art & Craft": [
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80", // Pencils
        "https://images.unsplash.com/photo-1572916172675-7301c3bc6566?w=400&q=80", // Paints
        "https://images.unsplash.com/photo-1579783902614-a3fb39279c23?w=400&q=80", // Canvas
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80", // Sketchbook
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80", // Brushes
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80", // Paint jars
    ],
    "Exam Books": [
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80", // Book stack
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80", // Library
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80", // Open book
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80", // Study table
        "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400&q=80", // Classroom
    ],
    "Eco-Friendly Products": [
        "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5763?w=400&q=80", // Eco paper
        "https://images.unsplash.com/photo-1606312619070-d48b7065e994?w=400&q=80", // Metal/Eco bottle
        "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80", // Bamboo pen
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80", // Plantable pencil feel
    ]
};

// Helpers for generating products
const generateProducts = (category: string, baseNames: string[], adjectives: string[], sizes: string[], startId: number, count: number): Product[] => {
    const products: Product[] = [];
    const imagePool = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["School Essentials"];

    for (let i = 0; i < count; i++) {
        // Randomly pick attributes
        const base = baseNames[Math.floor(Math.random() * baseNames.length)];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const size = sizes[Math.floor(Math.random() * sizes.length)];

        // Construct realistic name
        const name = `${adj} ${base} - ${size}`;

        // Pick an image from the curated pool
        // Using i % length ensures even distribution of images
        const image = imagePool[i % imagePool.length];

        products.push({
            id: startId + i,
            name: name,
            category: category,
            image: image
        });
    }
    return products;
};

const schoolProducts = generateProducts(
    "School Essentials",
    ["Notebook", "Geometry Box", "School Bag", "Lunch Box", "Water Bottle", "Pencil Pouch"],
    ["Classmate", "Doms", "Premium", "Durable", "Disney Themed", "Waterproof", "Spiral Binding"],
    ["Pack of 6", "Set of 3", "Large Size", "Medium", "with Compartments", "Blue Color", "Red Color"],
    1000,
    110
);

const officeProducts = generateProducts(
    "Office Stationery",
    ["Roller Pen", "A4 Paper", "Sticky Notes", "File Organizer", "Whiteboard Marker", "Stapler", "Calculator"],
    ["Parker", "JK Copier", "Neon", "Executive", "Heavy Duty", "Smooth Flow", "Professional"],
    ["Blue Ink", "500 Sheets", "Pack of 100", "Desktop Size", "Set of 4", "Black Ink"],
    2000,
    110
);

const artProducts = generateProducts(
    "Art & Craft",
    ["Color Pencils", "Acrylic Paint", "Canvas Board", "Sketch Book", "Calligraphy Pen", "Paint Brushes", "Clay Set"],
    ["Faber-Castell", "Artist Grade", "Camel", "Professional", "Soft Pastels", "Vibrant"],
    ["24 Shades", "12 Colors", "10x12 In", "A3 Size", "Set of 6", "Assorted"],
    3000,
    110
);

const examProducts = generateProducts(
    "Exam Books",
    ["Mathematics", "Science", "English Grammar", "Question Bank", "Solved Papers", "Reasoning Guide"],
    ["NCERT", "Oswaal", "Competition", "JEE Prep", "NEET Guide", "Advanced"],
    ["Class 10", "Class 12", "Latest Edition", "2024-25", "Volume 1", "Complete Set"],
    4000,
    110
);

const ecoProducts = generateProducts(
    "Eco-Friendly Products",
    ["Recycled Notebook", "Bamboo Pen", "Jute Bag", "Seed Pencils", "Paper Straws", "Wooden Ruler"],
    ["Handmade", "Organic", "Sustainable", "Biodegradable", "Earth Friendly", "Zero Waste"],
    ["Unruled", "Blue Ink", "Large Tote", "Pack of 5", "Pack of 50", "Natural Finish"],
    5000,
    110
);

export const products: Product[] = [
    ...schoolProducts,
    ...officeProducts,
    ...artProducts,
    ...examProducts,
    ...ecoProducts
];
