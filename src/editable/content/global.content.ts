import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Local business vendor guide',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'Local business vendor guide',
    utilityLinks: [
      { label: 'List with Us', href: '/create' },
      { label: 'Contact', href: '/contact' },
    ],
    primaryLinks: [
      { label: 'Home', href: '/' },
      { label: 'Articles', href: '/article' },
      { label: 'Guides', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'More', href: '/search' },
    ],
    actions: {
      primary: { label: 'List with Us', href: '/create' },
      secondary: { label: 'Log in', href: '/login' },
    },
  },
  footer: {
    tagline: 'Local reads and practical discovery',
    description: 'Browse vendors, local services, new offers, and editorial notes through one polished city-style directory experience.',
    columns: [
      {
        title: 'Browse',
        links: [
          { label: 'Articles', href: '/article' },
          { label: 'Search', href: '/search' },
          { label: 'Create', href: '/create' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        title: 'Site Content',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Search', href: '/search' },
          { label: 'Create', href: '/create' },
        ],
      },
    ],
    bottomNote: 'Built for browsing local business vendors with clarity and personality.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
