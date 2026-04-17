# SEO Template Guide for Next.js Blog

This document explains the complete SEO implementation for this Next.js blog template. Use this guide when duplicating the site for other niches.

---

## Table of Contents

1. [Environment Variables](#1-environment-variables)
2. [Root Layout SEO (layout.tsx)](#2-root-layout-seo-layouttsx)
3. [Sitemap Configuration](#3-sitemap-configuration)
4. [Robots.txt Configuration](#4-robotstxt-configuration)
5. [Post Page SEO](#5-post-page-seo)
6. [Category Page SEO](#6-category-page-seo)
7. [RSS Feed](#7-rss-feed)
8. [Image Optimization](#8-image-optimization)
9. [Customization Checklist](#9-customization-checklist)

---

## 1. Environment Variables

**File:** `.env.local`

```env
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Required: Site URL (CRITICAL for SEO)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: Coupang Partners Affiliate ID
NEXT_PUBLIC_COUPANG_PARTNER_ID=your-partner-id

# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Google Search Console Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```

### What to Change for New Sites:
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Your production domain | `https://camping-blog.com` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID | `G-ABC123XYZ` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console verification code | `abc123...` |

---

## 2. Root Layout SEO (layout.tsx)

**File:** `src/app/layout.tsx`

### 2.1 Metadata Configuration

```typescript
export const metadata: Metadata = {
  title: {
    default: "사이트 기본 제목",           // Default title for homepage
    template: "%s | 사이트 이름",          // Template for sub-pages
  },
  description: "사이트 설명 (155자 이내 권장)",
  keywords: ["키워드1", "키워드2", "키워드3"],
  authors: [{ name: "사이트 이름" }],

  // Open Graph (Facebook, LinkedIn, KakaoTalk)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "사이트 이름",
    title: "사이트 제목",
    description: "사이트 설명",
  },

  // Robots Configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,      // Unlimited video preview
      "max-image-preview": "large", // Large image preview
      "max-snippet": -1,            // Unlimited snippet length
    },
  },

  // Google Search Console Verification
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },

  // Canonical URL & Language Alternates
  alternates: {
    canonical: siteUrl,
    languages: {
      "ko-KR": siteUrl,
      "x-default": siteUrl,
    },
    types: {
      "application/rss+xml": `${siteUrl}/feed.xml`,
    },
  },
};
```

### 2.2 JSON-LD Schemas (Structured Data)

#### WebSite Schema (enables sitelinks searchbox)
```typescript
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "사이트 이름",
  alternateName: "Site Name in English",
  url: siteUrl,
  description: "사이트 설명",
  inLanguage: "ko-KR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};
```

#### Organization Schema
```typescript
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "사이트 이름",
  alternateName: "Site Name in English",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: "조직 설명",
  sameAs: [
    // Add social media URLs here
    // "https://www.youtube.com/@yourchannel",
    // "https://www.instagram.com/yourprofile",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Korean"],
  },
};
```

### 2.3 Google Analytics Integration

```typescript
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// In <head>:
{GA_MEASUREMENT_ID && (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          page_path: window.location.pathname,
        });
      `}
    </Script>
  </>
)}
```

### What to Change for New Sites:
- [ ] `title.default` - Main site title
- [ ] `title.template` - Title template pattern
- [ ] `description` - Site description
- [ ] `keywords` - Relevant keywords array
- [ ] `openGraph.siteName` - Site name for social sharing
- [ ] `websiteJsonLd.name` / `alternateName`
- [ ] `organizationJsonLd.name` / `description`
- [ ] `organizationJsonLd.sameAs` - Add social media links

---

## 3. Sitemap Configuration

**File:** `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'
import { getAllPostSlugs, getCategories } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

  // Get dynamic content from database
  const posts = await getAllPostSlugs()
  const categories = await getCategories()

  // Static pages (homepage, about, etc.)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Add more static pages as needed:
    // { url: `${siteUrl}/about`, lastModified: new Date(), priority: 0.5 },
  ]

  // Dynamic post pages
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/posts/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/category/${encodeURIComponent(cat.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...postPages, ...categoryPages]
}
```

### Priority Guidelines:
| Page Type | Priority | Change Frequency |
|-----------|----------|------------------|
| Homepage | 1.0 | daily |
| Posts/Articles | 0.8 | weekly |
| Categories | 0.6 | weekly |
| Static pages (About, Contact) | 0.5 | monthly |

---

## 4. Robots.txt Configuration

**File:** `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
```

### What to Change for New Sites:
- [ ] Add any additional paths to `disallow` array
- [ ] Add `/private/`, `/dashboard/` if applicable

---

## 5. Post Page SEO

**File:** `src/app/posts/[slug]/page.tsx`

### 5.1 Dynamic Metadata Generation

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  return {
    title: post.title,
    description: post.description,
    keywords: post.seo_keywords?.join(', '),

    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: post.featured_image ? [post.featured_image] : undefined,
      url: `${siteUrl}/posts/${post.slug}`,
    },

    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.featured_image ? [post.featured_image] : undefined,
    },

    alternates: {
      canonical: `${siteUrl}/posts/${post.slug}`,
      languages: {
        'ko-KR': `${siteUrl}/posts/${post.slug}`,
        'x-default': `${siteUrl}/posts/${post.slug}`,
      },
    },
  }
}
```

### 5.2 Article JSON-LD Schema

```typescript
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.description,
  image: post.featured_image,
  datePublished: post.published_at,
  dateModified: post.updated_at,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${siteUrl}/posts/${post.slug}`,
  },
  author: {
    '@type': 'Organization',
    name: '사이트 이름',
    url: siteUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: '사이트 이름',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
    },
  },
}
```

### 5.3 Product Schema (for Affiliate Products)

```typescript
const productJsonLd = post.product_price ? {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: post.product_name || post.title,
  description: post.description,
  image: post.featured_image,
  category: post.category,

  // Aggregate Rating (generates star ratings in search results)
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',      // Rating out of 5
    bestRating: '5',
    worstRating: '1',
    reviewCount: '50',        // Number of reviews
  },

  // Offer/Price Information
  offers: {
    '@type': 'Offer',
    url: post.affiliate_url || `${siteUrl}/posts/${post.slug}`,
    priceCurrency: 'KRW',
    price: post.product_price,
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: '판매처 이름',     // e.g., '쿠팡', 'Amazon'
    },
  },
} : null
```

### 5.4 Breadcrumb Schema

```typescript
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '홈',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: post.category,
      item: `${siteUrl}/category/${encodeURIComponent(post.category)}`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: post.title,
      item: `${siteUrl}/posts/${post.slug}`,
    },
  ],
}
```

### 5.5 FAQ Schema (for FAQ Rich Results)

```typescript
const faqJsonLd = post.faq && post.faq.length > 0 ? {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: post.faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
} : null
```

---

## 6. Category Page SEO

**File:** `src/app/category/[category]/page.tsx`

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const categoryUrl = `${siteUrl}/category/${encodeURIComponent(decodedCategory)}`

  return {
    title: `${decodedCategory} 카테고리`,
    description: `${decodedCategory} 관련 제품 리뷰 모음 - 최신 제품 비교 분석과 구매 가이드`,

    openGraph: {
      title: `${decodedCategory} - 사이트 이름`,
      description: `${decodedCategory} 관련 제품 리뷰 모음`,
      type: 'website',
      url: categoryUrl,
      siteName: '사이트 이름',
      locale: 'ko_KR',
    },

    alternates: {
      canonical: categoryUrl,
      languages: {
        'ko-KR': categoryUrl,
        'x-default': categoryUrl,
      },
    },
  }
}
```

---

## 7. RSS Feed

**File:** `src/app/feed.xml/route.ts`

```typescript
import { getPublishedPosts } from '@/lib/supabase-server'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const posts = await getPublishedPosts(50)

  const rssItems = posts.map((post) => {
    const pubDate = post.published_at
      ? new Date(post.published_at).toUTCString()
      : new Date().toUTCString()

    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/posts/${post.slug}</guid>
      <description><![CDATA[${post.description || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${post.category}]]></category>
      ${post.featured_image ? `<enclosure url="${post.featured_image}" type="image/jpeg" />` : ''}
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>사이트 이름</title>
    <link>${siteUrl}</link>
    <description>사이트 설명</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>사이트 이름</title>
      <link>${siteUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
```

### What to Change for New Sites:
- [ ] `<title>` - RSS feed title
- [ ] `<description>` - RSS feed description
- [ ] `<language>` - Language code (ko-KR, en-US, etc.)

---

## 8. Image Optimization

**File:** `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
      // Add affiliate CDN domains as needed:
      // Coupang
      {
        protocol: 'https',
        hostname: 'thumbnail*.coupangcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'image*.coupangcdn.com',
      },
      // Amazon (if needed)
      // {
      //   protocol: 'https',
      //   hostname: 'm.media-amazon.com',
      // },
    ],
    // Modern image formats for better performance
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
```

### What to Change for New Sites:
- [ ] Add CDN domains for your affiliate network images
- [ ] Add any other external image sources

---

## 9. Customization Checklist

Use this checklist when duplicating the site for a new niche:

### Environment Variables (.env.local)
- [ ] `NEXT_PUBLIC_SITE_URL` - Set production domain
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Create new GA4 property
- [ ] `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - Verify in Search Console
- [ ] Supabase credentials - Create new project or update

### layout.tsx
- [ ] Update `title.default` and `title.template`
- [ ] Update `description`
- [ ] Update `keywords` array
- [ ] Update `openGraph.siteName`
- [ ] Update `websiteJsonLd.name`, `alternateName`, `description`
- [ ] Update `organizationJsonLd.name`, `description`
- [ ] Add social media links to `sameAs`

### sitemap.ts
- [ ] Add any additional static pages
- [ ] Verify default URL is updated

### robots.ts
- [ ] Add any paths to block (admin, private, etc.)

### feed.xml/route.ts
- [ ] Update `<title>` and `<description>`

### posts/[slug]/page.tsx
- [ ] Update `author.name` and `publisher.name`
- [ ] Update seller name in Product schema
- [ ] Update breadcrumb home label if needed

### category/[category]/page.tsx
- [ ] Update `openGraph.siteName`
- [ ] Update description template

### next.config.ts
- [ ] Add CDN domains for new affiliate images

### Static Assets
- [ ] Replace `/public/logo.png` with new logo
- [ ] Add Open Graph default image `/public/og-image.png`
- [ ] Update favicon

---

## SEO Testing Checklist

After deployment, verify:

1. **Google Search Console**
   - [ ] Site verified
   - [ ] Sitemap submitted
   - [ ] No coverage errors

2. **Rich Results Test** (https://search.google.com/test/rich-results)
   - [ ] Article schema valid
   - [ ] Product schema valid (if applicable)
   - [ ] FAQ schema valid (if applicable)
   - [ ] Breadcrumb schema valid

3. **Mobile-Friendly Test** (https://search.google.com/test/mobile-friendly)
   - [ ] Page is mobile-friendly

4. **PageSpeed Insights** (https://pagespeed.web.dev/)
   - [ ] Core Web Vitals passing
   - [ ] Performance score > 80

5. **Social Preview**
   - [ ] Facebook Debugger (https://developers.facebook.com/tools/debug/)
   - [ ] Twitter Card Validator (https://cards-dev.twitter.com/validator)
   - [ ] LinkedIn Post Inspector

---

## Notes

- **ISR (Incremental Static Regeneration)**: All dynamic pages use `revalidate = 3600` (1 hour) for optimal performance and freshness
- **Static Generation**: Posts and categories are pre-rendered at build time via `generateStaticParams()`
- **Language**: Default is Korean (ko-KR). Update `<html lang="">` and all locale settings for other languages
- **Affiliate Disclaimer**: Footer includes Coupang Partners disclosure (required by Korean law)




  Quick Start for New Site:

  1. Copy the project
  2. Update .env.local with new domain and credentials
  3. Follow the checklist in Section 9
  4. Replace logo and favicon
  5. Deploy and verify with Search Console