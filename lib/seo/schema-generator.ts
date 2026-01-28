
import type { Business, Service, TargetLocation, KnowledgeEntity, PseoPageInstance } from '../types';

/**
 * Generates the specific Service-Location JSON-LD Schema.
 * 
 * Complies with:
 * - Nested Service -> LocalBusiness structure
 * - FAQPage mainEntity
 * - recursive isPartOf WebPage/WebSite
 * - about/mentions linking
 */
export const generateServiceLocationSchema = (
  business: Business,
  service: Service,
  location: TargetLocation,
  page: PseoPageInstance,
  knowledgeEntities: KnowledgeEntity[], // Must be pre-filtered for this page
  faqs: { question: string; answer: string }[]
): string => {

  const siteUrl = business.website_url?.replace(/\/$/, '') || 'https://example.com';
  const pageUrl = `${siteUrl}/${service.base_slug}/${location.slug}`; // Construction assumption
  const logoUrl = business.logo_url || `${siteUrl}/logo.png`;

  // 1. Construct Main FAQ Entity
  const faqSchema = faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }));

  // 2. Resolve About/Mentions Entities
  // We expect knowledgeEntities to be passed in. We categorize them based on page.about_external_ids / page.mentions_external_ids
  // For this generator, we assume the passed array IS the list to use, or we filter if IDs are available.
  
  const mapEntity = (e: KnowledgeEntity) => ({
    "@type": "Thing",
    "name": e.name,
    "@id": e.wikidata_url || undefined,
    "sameAs": e.wikipedia_url || undefined
  });

  const aboutEntities = knowledgeEntities
    .filter(e => page.about_external_ids?.includes(e.id))
    .map(mapEntity);

  const mentionEntities = knowledgeEntities
    .filter(e => page.mentions_external_ids?.includes(e.id))
    .map(mapEntity);

  // 3. Construct Service/Location Specifics
  const serviceArea = [
    {
      "@type": "Place",
      "name": location.name,
      "geo": location.geo_data ? {
        "@type": "GeoCoordinates",
        "latitude": location.geo_data.lat,
        "longitude": location.geo_data.lng
      } : undefined
    },
    // Add Parent Region if available
    ...(location.address_region ? [{
      "@type": "AdministrativeArea",
      "name": location.address_region
    }] : []),
    // Add Country
    {
      "@type": "Country",
      "name": location.address_country || "United Kingdom"
    }
  ];

  // 4. Build Full Schema Object
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#FAQPage`,
    "mainEntity": faqSchema,
    "isPartOf": {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      "url": pageUrl,
      "name": page.seo_title,
      "description": page.seo_meta_desc,
      "isFamilyFriendly": "true",
      "about": aboutEntities.length > 0 ? aboutEntities : undefined,
      "mentions": mentionEntities.length > 0 ? mentionEntities : undefined,
      "isPartOf": {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        "url": siteUrl,
        "name": business.name,
        "publisher": {
          "@type": "LocalBusiness",
          "@id": `${siteUrl}/#localbusiness`,
          "name": business.name,
          "url": siteUrl,
          "telephone": business.telephone,
          "priceRange": business.price_range,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": business.street_address,
            "addressLocality": business.address_locality,
            "addressRegion": business.address_region,
            "postalCode": business.postal_code,
            "addressCountry": business.address_country
          },
          "sameAs": business.social_links as string[]
        }
      },
      "mainEntity": {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        "name": service.name,
        "serviceType": service.service_type || service.category,
        "areaServed": serviceArea,
        "provider": {
          "@type": "LocalBusiness",
          "name": business.name,
          "@id": `${siteUrl}/#localbusiness`,
          "url": siteUrl,
          "image": logoUrl,
          "telephone": business.telephone,
          "priceRange": business.price_range,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": business.street_address,
            "addressLocality": business.address_locality,
            "addressRegion": business.address_region,
            "postalCode": business.postal_code,
            "addressCountry": business.address_country
          },
          "geo": business.latitude && business.longitude ? {
             "@type": "GeoCoordinates",
             "latitude": business.latitude,
             "longitude": business.longitude
          } : undefined,
          "sameAs": business.social_links as string[]
        }
      }
    }
  };

  // Clean undefined values
  const clean = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(v => clean(v)).filter(v => v !== undefined);
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .map(([k, v]) => [k, clean(v)])
          .filter(([_, v]) => v !== undefined)
      );
    }
    return obj;
  };

  const finalSchema = clean(schema);

  return `<!-- pomegranate.marketing schema markup -->\n<script type="application/ld+json">\n${JSON.stringify(finalSchema, null, 4)}\n</script>\n<!-- /pomegranate.marketing schema markup -->`;
};
