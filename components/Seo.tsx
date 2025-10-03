import { Helmet } from "react-helmet-async";
import { defaultDescription, defaultImage, defaultKeywords, defaultTitle, organizationSchema, siteUrl, webSiteSchema } from "@/config/seo";
import type { SeoProps } from "@/config/seo";

const ensureAbsoluteUrl = (value?: string) => {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `${siteUrl}${value}`;
  return `${siteUrl}/${value}`;
};

const normalizeStructuredData = (input: SeoProps["structuredData"]) => {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
};

const Seo = ({
  title = defaultTitle,
  description = defaultDescription,
  canonical = "/",
  image,
  type = "website",
  noIndex = false,
  keywords = defaultKeywords,
  structuredData,
  children,
}: SeoProps) => {
  const canonicalUrl = ensureAbsoluteUrl(canonical);
  const ogImage = ensureAbsoluteUrl(image ?? defaultImage);
  const keywordContent = keywords.filter(Boolean).join(", ");

  const structuredDataEntries = [webSiteSchema, organizationSchema, ...normalizeStructuredData(structuredData)];

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywordContent && <meta name="keywords" content={keywordContent} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:site_name" content="NW-Builds" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content={type} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {structuredDataEntries.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {children}
    </Helmet>
  );
};

export default Seo;
