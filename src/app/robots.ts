import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/event';

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/register/success'] }], sitemap: `${SITE_URL}/sitemap.xml` };
}
