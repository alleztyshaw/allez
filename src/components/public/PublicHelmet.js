// src/components/public/PublicHelmet.js
// Shared meta tag component for all public-facing pages.
// Uses react-helmet-async — requires HelmetProvider in App.js.
//
// Usage:
//   <PublicHelmet
//     title="Company — Allez HQ"
//     description="Why we built Allez HQ and the experience behind it."
//   />
//   <PublicHelmet title="Sign In — Allez HQ" noindex />

import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://allezhq.com';

export default function PublicHelmet({ title, description, noindex = false, path = '' }) {
  const canonical = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title"       content={title} />
      <meta property="og:site_name"   content="Allez HQ" />
      <meta property="og:type"        content="website" />
      <meta property="og:url"         content={canonical} />
      {description && <meta property="og:description" content={description} />}

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary" />
      <meta name="twitter:title"       content={title} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
}