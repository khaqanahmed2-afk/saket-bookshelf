
import { Helmet } from "react-helmet-async";

export function BulkOrdersSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WholesaleStore",
        "name": "Saket Pustak Kendra",
        "image": "https://saketpustakkendra.in/og-image.jpg",
        "description": "Leading wholesale stationery supplier in Ayodhya for schools, offices, and coaching centers. Bulk notebooks, exam copies, and office supplies.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Main Road",
            "addressLocality": "Rudauli",
            "addressRegion": "Uttar Pradesh",
            "postalCode": "224120",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "26.7469",
            "longitude": "81.7460"
        },
        "url": "https://saketpustakkendra.in/bulk-orders",
        "telephone": "+917754057200",
        "priceRange": "₹₹",
        "areaServed": [
            {
                "@type": "City",
                "name": "Ayodhya"
            },
            {
                "@type": "City",
                "name": "Rudauli"
            },
            {
                "@type": "City",
                "name": "Faizabad"
            }
        ],
        "paymentAccepted": ["Cash", "UPI", "Bank Transfer"],
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ],
            "opens": "09:00",
            "closes": "20:00"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}
