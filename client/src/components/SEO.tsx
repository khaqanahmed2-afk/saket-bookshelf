import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export function SEO({
  title = "Saket Pustak Kendra | Books & Stationery in Rudauli, Ayodhya",
  description = "Trusted stationery wholesaler & bookstore in Rudauli, Ayodhya. Premium NCERT books, competitive exam materials, school supplies. ⭐4.5 Rating. WhatsApp: +91 77540 57200",
  keywords = "bookstore Rudauli, stationery shop Ayodhya, NCERT books Rudauli, competitive exam books Ayodhya, school supplies Rudauli, office stationery Ayodhya, Saket Pustak Kendra",
  canonical = "https://saketpustakkendra.in/",
  ogImage = "https://saketpustakkendra.in/images/og-image.jpg",
  ogType = "website"
}: SEOProps) {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Saket Pustak Kendra" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
