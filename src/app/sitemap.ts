import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/event';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/register', '/livestream'].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'daily', priority: p ? 0.8 : 1 }));
}
