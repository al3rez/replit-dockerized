/**
 * Types for sitemap XML structure
 */

export interface SitemapIndexItem {
  loc: string;
  lastmod?: string;
}

export interface SitemapItem {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export interface Url {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}