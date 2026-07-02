import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'Editorial desk',
    headline: 'Popular reads, fresh notes, and deeper local stories.',
    description: 'This archive leans into a magazine rhythm so articles feel curated, readable, and worth opening.',
    filterLabel: 'Choose article topic',
    secondaryNote: 'Lead with hierarchy and familiarity instead of blog-template repetition.',
    chips: ['Popular articles', 'Fresh reads', 'Editorial picks'],
  },
  classified: {
    eyebrow: 'Notice board',
    headline: 'Offers and notices arranged for fast practical scanning.',
    description: 'Classifieds should feel current, useful, and easy to compare at a glance.',
    filterLabel: 'Filter classified category',
    secondaryNote: 'Keep price, condition, and location visible early.',
    chips: ['Fast scan', 'Practical', 'Timely offers'],
  },
  sbm: {
    eyebrow: 'Saved resources',
    headline: 'Useful links and references, arranged like a curated board.',
    description: 'Bookmarks work best when they feel compact, sorted, and easy to revisit.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Keep metadata light and destination cues obvious.',
    chips: ['Collections', 'Useful links', 'Quick access'],
  },
  profile: {
    eyebrow: 'Profiles',
    headline: 'People, brands, and local identities with stronger presence.',
    description: 'Profiles should feel credible and visual rather than buried inside a generic card grid.',
    filterLabel: 'Filter profile category',
    secondaryNote: 'Identity comes first, supporting detail second.',
    chips: ['Identity first', 'Trust cues', 'Local presence'],
  },
  pdf: {
    eyebrow: 'Document room',
    headline: 'Guides, files, and downloadable references with library structure.',
    description: 'Document pages should feel organized and useful, with clear preview and download actions.',
    filterLabel: 'Filter document type',
    secondaryNote: 'Lead with utility and clarity.',
    chips: ['Guides', 'Downloads', 'Reference files'],
  },
  listing: {
    eyebrow: 'Business guide',
    headline: 'Featured vendors, local services, and practical business discovery.',
    description: 'Listings should feel like a modern directory with enough editorial polish to make browsing enjoyable.',
    filterLabel: 'Filter business category',
    secondaryNote: 'Keep the search-first, city-board feel from the reference.',
    chips: ['Featured listings', 'Popular services', 'Directory search'],
  },
  image: {
    eyebrow: 'Visual board',
    headline: 'Image-led posts with a gallery rhythm and stronger atmosphere.',
    description: 'Visual content should feel immersive first, with supporting copy kept light.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Let the image carry the page before the metadata does.',
    chips: ['Gallery', 'Visual first', 'Mood driven'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
