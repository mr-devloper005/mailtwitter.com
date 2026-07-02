import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Local listings, offers, and practical reads',
      description: 'Browse business listings, classifieds, and editorial posts in one polished local discovery experience.',
      openGraphTitle: 'Local listings, offers, and practical reads',
      openGraphDescription: 'Discover vendors, services, and useful reads through a dark editorial directory layout.',
      keywords: ['local listings', 'business vendors', 'classified ads', 'editorial directory'],
    },
    hero: {
      badge: 'Fresh picks',
      title: ['A city-style board for', 'vendors, listings, and local reads.'],
      description: 'Find featured businesses, timely offers, and practical stories without losing the fast-scanning feel of a real listing hub.',
      primaryCta: { label: 'Browse articles', href: '/article' },
      secondaryCta: { label: 'Search the site', href: '/search' },
      searchPlaceholder: 'Search vendors, offers, articles, and places',
      focusLabel: 'Featured right now',
      featureCardBadge: 'editorial directory',
      featureCardTitle: 'A magazine-like homepage built from live post data.',
      featureCardDescription: 'The layout stays visual and dense while every section still renders from the existing feed.',
    },
    intro: {
      badge: 'Why people browse',
      title: 'A cleaner way to move between listings, offers, and practical stories.',
      paragraphs: [
        'The homepage is organized like a city guide: bold highlights first, then category browsing, popular reads, and utility sections that help people keep moving.',
        'Business listings, editorial posts, and time-sensitive notices now sit in one visual system so the site feels established instead of stitched together.',
        'Everything stays compatible with the same routes and live post data, while the browsing experience feels more premium and intentional.',
      ],
      sideBadge: 'What changes',
      sidePoints: [
        'Featured cards and editorial rails create a stronger first impression.',
        'Featured content becomes easier to scan with practical metadata and stronger hierarchy.',
        'Category and location blocks add the directory feel shown in the reference.',
        'The dark shell, bright accents, and compact spacing keep the site distinctive.',
      ],
      primaryLink: { label: 'Browse articles', href: '/article' },
      secondaryLink: { label: 'Search the site', href: '/search' },
    },
    cta: {
      badge: 'Share your business',
      title: 'Put your listing, offer, or update in front of local browsers.',
      description: 'Use the existing publishing flow to add a vendor profile, post an offer, or share a practical update with the community.',
      primaryCta: { label: 'Create a listing', href: '/create' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'About',
    title: 'A local discovery site with a more editorial point of view.',
    description: `${slot4BrandConfig.siteName} brings business listings, quick offers, and practical articles into one city-style browsing experience.`,
    paragraphs: [
      'People do not always arrive knowing whether they need a directory result, a classified offer, or a useful read. This layout helps them move naturally between all three.',
      'The design focuses on bold hierarchy, cleaner scanning, and practical utility while keeping the site approachable on mobile.',
    ],
    values: [
      {
        title: 'Useful first',
        description: 'Every section is built to help people scan, compare, and keep moving without distraction.',
      },
      {
        title: 'Editorial polish',
        description: 'The visual system borrows from magazine layouts so the site feels more established and memorable.',
      },
      {
        title: 'Flexible discovery',
        description: 'Stories, images, profiles, and supporting content all stay connected through one consistent experience.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Reach out about a listing, a partnership, or a support question.',
    description: 'Share what you need help with and we will point it toward the right next step.',
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: 'Search',
      description: 'Search vendors, offers, and posts across the site.',
    },
    hero: {
      badge: 'Search the directory',
      title: 'Find local businesses, offers, and useful reads faster.',
      description: 'Search across live site content from every active section without leaving the browsing flow.',
      placeholder: 'Search by business name, topic, place, or category',
    },
    resultsTitle: 'Latest searchable content',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Create and submit new content for the site.',
    },
    locked: {
      badge: 'Member access',
      title: 'Log in to publish a new post.',
      description: 'Use your account to open the publishing workspace and submit a listing, offer, article, or profile.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Create a new post for an active section.',
      description: 'Choose the content type, add the essentials, and publish through the existing flow.',
    },
    formTitle: 'Post details',
    submitLabel: 'Submit post',
    successTitle: 'Post submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login page for this site.',
      badge: 'Member access',
      title: 'Welcome back.',
      description: 'Log in to manage your submissions and continue publishing through the site.',
      formTitle: 'Log in',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then log in.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Signup page for this site.',
      badge: 'New account',
      title: 'Create your account and start publishing.',
      description: 'Sign up to access the publishing workspace and manage your posts.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Log in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested profiles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
