import Link from 'next/link'
import {
  ArrowRight, Building2, ChevronRight, Clock3, FileText, Globe2, Image as ImageIcon,
  MapPin, Megaphone, Search, UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, getEditableExcerpt, getEditableCategory, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Globe2,
  pdf: FileText,
  profile: UserRound,
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'
const categories = CATEGORY_OPTIONS.slice(0, 20)
const locationLinks = ['Australia', 'India', 'Pakistan', 'Saudi Arabia', 'Singapore', 'United Arab Emirates', 'United Kingdom', 'United States']

function dedupePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

function ratingOf(post: SitePost) {
  const key = post.slug || post.id || post.title || 'x'
  let hash = 0
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return (4 + (hash % 9) / 10).toFixed(1)
}

function dateLabel(post?: SitePost) {
  const raw = post?.publishedAt || post?.createdAt || post?.updatedAt
  if (!raw) return 'Fresh today'
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return 'Fresh today'
  return parsed.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function sectionPool(posts: SitePost[], timeSections: HomeTimeSection[]) {
  return dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
}

function FeaturedOverlayCard({ post, href, large = false }: { post: SitePost; href: string; large?: boolean }) {
  return (
    <Link href={href} className={`group relative block overflow-hidden rounded-[2rem] border border-white/8 bg-white/5 ${large ? 'min-h-[420px]' : 'min-h-[200px]'}`}>
      <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(62,44,35,0.06),rgba(62,44,35,0.82))]" />
      <div className="relative flex h-full flex-col justify-end p-5">
        <span className="w-fit rounded-full bg-black/35 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--slot4-accent-fill)]">
          {getEditableCategory(post)}
        </span>
        <h3 className={`mt-3 font-extrabold leading-tight tracking-[-0.04em] text-[var(--slot4-dark-text)] ${large ? 'text-3xl sm:text-4xl' : 'text-[1.85rem]'}`}>
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 max-w-lg text-sm leading-6 text-[var(--slot4-dark-text)]/80">{getEditableExcerpt(post, large ? 180 : 120)}</p>
      </div>
    </Link>
  )
}

function CompactFeatureCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-[1.7rem] border border-white/8 bg-white/5">
      <div className="relative aspect-[5/4] overflow-hidden">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(62,44,35,0.04),rgba(62,44,35,0.82))]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="line-clamp-2 text-xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--slot4-dark-text)]">{post.title}</h3>
        <p className="mt-1 text-sm font-semibold text-[var(--slot4-accent-fill)]">{getEditableCategory(post)}</p>
      </div>
    </Link>
  )
}

function EditorialItem({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group flex items-start gap-4 border-t border-white/8 py-5 first:border-t-0 first:pt-0">
      <span className="editable-display shrink-0 text-4xl font-extrabold leading-none text-[var(--slot4-dark-muted-text)]">{index + 1}</span>
      <div>
        <h3 className="text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--slot4-dark-text)] group-hover:text-[var(--slot4-accent-fill)]">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-[var(--slot4-dark-muted-text)]">By {SITE_CONFIG.name}</p>
      </div>
    </Link>
  )
}

function HorizontalCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group grid gap-5 rounded-[2rem] border border-white/8 bg-white/4 p-4 transition hover:-translate-y-1 hover:bg-white/6 sm:grid-cols-[300px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-[1.6rem]">
        <img src={getEditablePostImage(post)} alt={post.title} className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="min-w-0 py-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--slot4-accent-fill)]">{dateLabel(post)}</p>
        <h3 className="mt-3 text-[2rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-[var(--slot4-dark-text)]">{post.title}</h3>
        <p className="mt-4 line-clamp-3 text-lg leading-8 text-[var(--slot4-dark-muted-text)]">{getEditableExcerpt(post, 180)}</p>
      </div>
    </Link>
  )
}

function TopicChip({ task }: { task: (typeof SITE_CONFIG.tasks)[number] }) {
  const Icon = taskIcon[task.key] || FileText
  return (
    <Link href={task.route} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white/45 px-4 py-2 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent-fill)] hover:text-[var(--slot4-page-text)]">
      <Icon className="h-4 w-4" /> {task.label}
    </Link>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = sectionPool(posts, timeSections)
  const lead = pool[0]
  const sideLead = pool[1]
  const popular = pool.slice(2, 7)
  const chips = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'listing' && task.key !== 'classified' && task.key !== 'profile').slice(0, 6)

  if (!lead) return null

  return (
    <section className="border-b border-white/6 bg-[var(--slot4-dark-bg)]">
      <div className={`${container} py-10 sm:py-12`}>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          {chips.map((task) => <TopicChip key={task.key} task={task} />)}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <HorizontalCard post={lead} href={postHref(primaryTask, lead, primaryRoute)} />
            {sideLead ? <HorizontalCard post={sideLead} href={postHref(primaryTask, sideLead, primaryRoute)} /> : null}
          </div>

          <aside className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
            <h2 className="editable-display text-4xl font-extrabold tracking-[-0.05em] text-[var(--slot4-dark-text)]">Popular Articles</h2>
            <div className="mt-5">
              {popular.map((post, index) => (
                <EditorialItem key={post.id || post.slug || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
              ))}
            </div>
            <div className="mt-6 border-t border-white/8 pt-6">
              <form action="/search" className="rounded-[1.6rem] border border-white/8 bg-white/4 p-4">
                <label className="flex items-center gap-3 rounded-full bg-white/65 px-4 py-3">
                  <Search className="h-4 w-4 text-[var(--slot4-accent)]" />
                  <input
                    name="q"
                    placeholder={pagesContent.home.hero.searchPlaceholder}
                    className="min-w-0 flex-1 bg-transparent text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  {chips.map((task) => (
                    <Link key={task.key} href={task.route} className="rounded-full bg-white/55 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-accent)] hover:text-[#1B140D]">
                      {task.label}
                    </Link>
                  ))}
                </div>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = sectionPool(posts, timeSections)
  const left = pool.slice(0, 2)
  const center = pool[2]
  const right = pool.slice(3, 5)

  if (!left.length || !center) return null

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-14`}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="editable-display text-4xl font-extrabold tracking-[-0.05em] text-[var(--slot4-page-text)]">Featured Picks</h2>
          <Link href="/search" className="text-lg font-bold text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent-fill)]">Browse More</Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
          <div className="space-y-6">
            {left.map((post) => (
              <CompactFeatureCard key={post.id || post.slug || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
          <FeaturedOverlayCard post={center} href={postHref(primaryTask, center, primaryRoute)} large />
          <div className="space-y-6">
            {right.map((post) => (
              <CompactFeatureCard key={post.id || post.slug || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function UtilityCard({ post, href, style }: { post: SitePost; href: string; style: 'compact' | 'image' | 'editorial' }) {
  if (style === 'editorial') {
    return (
      <Link href={href} className="group flex items-start gap-4 rounded-[1.7rem] border border-white/8 bg-white/4 p-5 transition hover:-translate-y-1 hover:bg-white/6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
          <Clock3 className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
          <h3 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent-fill)]">{post.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 130)}</p>
        </div>
      </Link>
    )
  }

  if (style === 'image') {
    return (
      <FeaturedOverlayCard post={post} href={href} />
    )
  }

  return (
    <Link href={href} className="group rounded-[1.7rem] border border-white/8 bg-white/4 p-5 transition hover:-translate-y-1 hover:bg-white/6">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">
          {getEditableCategory(post)}
        </span>
        <span className="text-sm font-bold text-[var(--slot4-soft-muted-text)]">{ratingOf(post)}</span>
      </div>
      <h3 className="mt-4 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent-fill)]">{post.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 140)}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-page-text)]">
        Open post <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = sectionPool(posts, timeSections).slice(0, 6)
  if (!pool.length) return null

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-10`}>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="editable-display text-4xl font-extrabold tracking-[-0.05em] text-[var(--slot4-page-text)]">Recent activity</h2>
            <p className="mt-2 max-w-2xl text-lg text-[var(--slot4-muted-text)]">A mixed feed of live posts arranged in multiple card styles so the homepage feels more like a real city board.</p>
          </div>
          <Link href={primaryRoute} className="hidden text-sm font-bold uppercase tracking-[0.16em] text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent-fill)] sm:inline-flex">
            Browse all
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {pool[0] ? <UtilityCard post={pool[0]} href={postHref(primaryTask, pool[0], primaryRoute)} style="compact" /> : null}
          {pool[1] ? <UtilityCard post={pool[1]} href={postHref(primaryTask, pool[1], primaryRoute)} style="editorial" /> : null}
          {pool[2] ? <UtilityCard post={pool[2]} href={postHref(primaryTask, pool[2], primaryRoute)} style="image" /> : null}
          {pool[3] ? <UtilityCard post={pool[3]} href={postHref(primaryTask, pool[3], primaryRoute)} style="editorial" /> : null}
          {pool[4] ? <UtilityCard post={pool[4]} href={postHref(primaryTask, pool[4], primaryRoute)} style="compact" /> : null}
          {pool[5] ? <UtilityCard post={pool[5]} href={postHref(primaryTask, pool[5], primaryRoute)} style="image" /> : null}
        </div>
      </div>
    </section>
  )
}

function CategoryLink({ name }: { name: string }) {
  return (
    <Link href={`/search?q=${encodeURIComponent(name)}`} className="text-lg font-bold text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent-fill)]">
      {name}
    </Link>
  )
}

export function EditableTimeCollections({ primaryTask: _primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = sectionPool(posts, timeSections)
  if (!pool.length) return null

  return (
    <>
      <section className="bg-[var(--slot4-page-bg)]">
        <div className={`${container} py-14`}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="editable-display text-4xl font-extrabold tracking-[-0.05em] text-[var(--slot4-page-text)]">Categories</h2>
            <Link href={primaryRoute} className="text-lg font-bold text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent-fill)]">All Categories</Link>
          </div>
          <div className="mt-8 grid gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => <CategoryLink key={category.slug} name={category.name} />)}
          </div>
        </div>
      </section>

      <section className="bg-[var(--slot4-page-bg)]">
        <div className={`${container} py-8`}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="editable-display text-4xl font-extrabold tracking-[-0.05em] text-[var(--slot4-page-text)]">Browse by location</h2>
            <Link href="/search" className="text-lg font-bold text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent-fill)]">More locations</Link>
          </div>
          <div className="mt-8 grid gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {locationLinks.map((location) => (
              <Link key={location} href={`/search?q=${encodeURIComponent(location)}`} className="inline-flex items-center gap-2 text-lg font-bold text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent-fill)]">
                <MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> {location}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function EditableHomeCta() {
  const enabledTasks = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'listing' && task.key !== 'classified' && task.key !== 'profile').slice(0, 4)
  return (
    <section className="border-t border-white/6 bg-[var(--slot4-dark-bg)]">
      <div className={`${container} py-16`}>
        <div className="rounded-[2.4rem] border border-white/8 bg-[linear-gradient(135deg,rgba(47,164,215,0.18),rgba(231,111,46,0.14))] p-8 sm:p-10 lg:p-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--slot4-accent-fill)]">{pagesContent.home.cta.badge}</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="editable-display max-w-3xl text-4xl font-extrabold leading-[1.03] tracking-[-0.05em] text-[var(--slot4-dark-text)] sm:text-5xl">
                {pagesContent.home.cta.title}
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--slot4-dark-text)]/80">{pagesContent.home.cta.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {enabledTasks.map((task) => <TopicChip key={task.key} task={task} />)}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={pagesContent.home.cta.primaryCta.href} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#1B140D] transition hover:bg-[var(--slot4-accent-fill)]">
                {pagesContent.home.cta.primaryCta.label}
              </Link>
              <Link href={pagesContent.home.cta.secondaryCta.href} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-6 py-3 text-sm font-extrabold text-[var(--slot4-dark-text)] transition hover:border-[var(--slot4-accent-fill)] hover:text-[var(--slot4-accent-fill)]">
                {pagesContent.home.cta.secondaryCta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
