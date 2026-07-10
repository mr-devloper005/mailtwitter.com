import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, ChevronDown, FileText, Globe, MapPin,
  Phone, Search, Star, UserRound,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const summaryOf = (post: SitePost) =>
  stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body) || 'More details inside.')

const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

const fieldOf = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const imageOf = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && Boolean(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && Boolean(url)) : []
  const fallback = [content.image, content.featuredImage, content.thumbnail, content.logo].find((value) => typeof value === 'string' && Boolean(value))
  return media[0] || images[0] || (typeof fallback === 'string' ? fallback : '') || '/placeholder.svg?height=900&width=1200'
}

const hashStr = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  return hash
}

const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((4 + (hashStr(post.slug || post.id || post.title || 'x') % 9) / 10) * 10) / 10
}

const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 8 + (hashStr((post.slug || post.title || 'x') + 'r') % 360)
}

const archiveAdSlotByTask: Partial<Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'>> = {
  article: 'in-feed',
  listing: 'header',
  profile: 'sidebar',
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const featured = posts[0]
  const spotlight = posts.slice(1, 4)
  const gridPosts = featured ? posts.slice(1 + spotlight.length) : posts
  const adSlot = archiveAdSlotByTask[task]

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <section className="border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--tk-accent)]">{voice.eyebrow}</p>
                <h1 className="editable-display mt-4 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-[4rem]">
                  {voice.headline}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--tk-muted)]">{voice.description}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {voice.chips.map((chip) => (
                    <span key={chip} className="rounded-full border border-[var(--tk-line)] bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tk-text)]">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-5">
                <form action={basePath} className="rounded-[1.5rem] border border-[var(--tk-line)] bg-white/4 p-4">
                  <div className="flex items-center gap-3 rounded-full bg-white/65 px-4 py-3">
                    <Search className="h-4 w-4 text-[var(--tk-accent)]" />
                    <span className="text-sm font-semibold text-[var(--tk-text)]">{label}</span>
                  </div>
                  <div className="relative mt-4">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-12 w-full appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 pr-10 text-sm font-semibold text-[var(--tk-text)] outline-none"
                      aria-label={voice.filterLabel}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  </div>
                  <button className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--tk-accent)] px-5 text-sm font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95">
                    Apply filter
                  </button>
                </form>

                <div className="mt-5 rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--tk-accent)]">Current archive</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">
                    <span className="font-bold text-[var(--tk-text)]">{posts.length}</span> posts in {categoryLabel}. Page {page} of {pagination.totalPages || 1}.
                  </p>
                </div>
              </div>
            </div>

            {featured ? (
              <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <FeatureArchiveCard task={task} post={featured} basePath={basePath} />
                <div className="space-y-4">
                  {spotlight.map((post, index) => (
                    <EditorialArchiveCard key={post.id || post.slug || post.title} task={task} post={post} basePath={basePath} index={index} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
          {adSlot ? (
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
            </div>
          ) : null}
          {gridPosts.length ? (
            <div className={task === 'listing' ? 'grid gap-5 xl:grid-cols-2' : task === 'classified' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : task === 'image' ? 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3' : 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'}>
              {gridPosts.map((post, index) => (
                <ArchivePostCard key={post.id || post.slug || post.title} task={task} post={post} basePath={basePath} index={index} />
              ))}
            </div>
          ) : posts.length ? null : (
            <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-[var(--tk-line)] bg-white/[0.03] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-3xl font-extrabold tracking-[-0.04em]">Nothing here yet</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Try another category, or check back later for new {label.toLowerCase()}.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-14 flex flex-wrap items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-3 font-bold transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-white/4 px-5 py-3 font-bold text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-3 font-bold transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function RatingRow({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-bold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

function hrefFor(task: TaskKey, basePath: string, post: SitePost) {
  return post.slug ? `${basePath}/${post.slug}` : buildPostUrl(task, post.slug)
}

function FeatureArchiveCard({ task, post, basePath }: { task: TaskKey; post: SitePost; basePath: string }) {
  const href = hrefFor(task, basePath, post)
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-white/5">
      <img src={imageOf(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.82))]" />
      <div className="relative flex min-h-[420px] flex-col justify-end p-6">
        <span className="w-fit rounded-full bg-white/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--tk-text)]">
          {categoryOf(post, task)}
        </span>
        <h2 className="editable-display mt-4 max-w-2xl text-3xl font-extrabold leading-[1.02] tracking-[-0.05em] text-[var(--tk-scrim-text)] sm:text-4xl">
          {post.title}
        </h2>
        <p className="mt-3 max-w-xl line-clamp-3 text-sm leading-7 text-[var(--tk-scrim-text)]/80">{summaryOf(post)}</p>
      </div>
    </Link>
  )
}

function EditorialArchiveCard({ task, post, basePath, index }: { task: TaskKey; post: SitePost; basePath: string; index: number }) {
  const href = hrefFor(task, basePath, post)
  return (
    <Link href={href} className="group flex items-start gap-4 rounded-[1.6rem] border border-[var(--tk-line)] bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]">
      <span className="editable-display text-4xl font-extrabold leading-none text-[var(--tk-muted)]">{index + 1}</span>
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{categoryOf(post, task)}</p>
        <h3 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{summaryOf(post)}</p>
      </div>
    </Link>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  if (task === 'listing') return <ListingArchiveCard post={post} href={hrefFor(task, basePath, post)} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={hrefFor(task, basePath, post)} index={index} />
  if (task === 'image') return <ImageArchiveCard post={post} href={hrefFor(task, basePath, post)} index={index} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={hrefFor(task, basePath, post)} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={hrefFor(task, basePath, post)} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={hrefFor(task, basePath, post)} />
  return index % 3 === 0
    ? <ImageFirstArticleCard post={post} href={hrefFor(task, basePath, post)} index={index} />
    : index % 3 === 1
      ? <CompactArticleCard post={post} href={hrefFor(task, basePath, post)} index={index} />
      : <HorizontalArticleCard post={post} href={hrefFor(task, basePath, post)} index={index} />
}

function ImageFirstArticleCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] transition hover:-translate-y-1 hover:bg-white/[0.05]">
      <div className="relative aspect-[16/11] overflow-hidden">
        <img src={imageOf(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tk-accent)]">Story {String(index + 1).padStart(2, '0')}</p>
        <h2 className="mt-3 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h2>
        <RatingRow post={post} />
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{summaryOf(post)}</p>
      </div>
    </Link>
  )
}

function CompactArticleCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</span>
        <span className="text-sm font-bold text-[var(--tk-muted)]">No. {String(index + 1).padStart(2, '0')}</span>
      </div>
      <h2 className="mt-4 line-clamp-3 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h2>
      <p className="mt-4 line-clamp-4 text-sm leading-7 text-[var(--tk-muted)]">{summaryOf(post)}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-text)]">
        Read article <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  )
}

function HorizontalArticleCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group grid gap-4 rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] p-4 transition hover:-translate-y-1 hover:bg-white/[0.05] sm:grid-cols-[150px_minmax(0,1fr)]">
      <img src={imageOf(post)} alt={post.title} className="aspect-[4/3] w-full rounded-[1.2rem] object-cover" />
      <div className="min-w-0 py-1">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tk-accent)]">Popular {String(index + 1).padStart(2, '0')}</p>
        <h2 className="mt-2 line-clamp-2 text-xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--tk-muted)]">{summaryOf(post)}</p>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const location = fieldOf(post, ['location', 'address', 'city'])
  const phone = fieldOf(post, ['phone', 'telephone', 'mobile'])
  const website = fieldOf(post, ['website', 'url'])
  return (
    <Link href={href} className="group grid gap-5 rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:bg-white/[0.05] sm:grid-cols-[120px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-[1.4rem] bg-[var(--tk-raised)]">
        <img src={imageOf(post)} alt={post.title} className="aspect-square h-full w-full object-cover" />
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h2>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]" />
        </div>
        <RatingRow post={post} />
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{summaryOf(post)}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-[var(--tk-text)]/80">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
        </div>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const price = fieldOf(post, ['price', 'amount', 'budget']) || 'Open offer'
  const location = fieldOf(post, ['location', 'address', 'city'])
  const condition = fieldOf(post, ['condition', 'availability', 'type']) || categoryOf(post, 'Classified')
  return (
    <Link href={href} className="group rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-extrabold tracking-[-0.05em] text-[var(--tk-accent)]">{price}</span>
        <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tk-accent)]">{condition}</span>
      </div>
      <h2 className="mt-5 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{summaryOf(post)}</p>
      <div className="mt-5 flex items-center justify-between border-t border-[var(--tk-line)] pt-4">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--tk-muted)]">{location || `Post ${String(index + 1).padStart(2, '0')}`}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] transition hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={imageOf(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.0),rgba(0,0,0,0.82))]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tk-accent-fill,var(--tk-accent))]">{categoryOf(post, 'Image')}</p>
          <h2 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-scrim-text)]">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = fieldOf(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className="group rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tk-accent)]">Saved {String(index + 1).padStart(2, '0')}</p>
      <h2 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{summaryOf(post)}</p>
      {website ? <p className="mt-4 truncate text-sm font-bold text-[var(--tk-text)]">{website.replace(/^https?:\/\//, '')}</p> : null}
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]">
      <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <FileText className="h-6 w-6" />
      </div>
      <h2 className="mt-5 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{summaryOf(post)}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-text)]">Open document <ArrowRight className="h-4 w-4" /></div>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const role = fieldOf(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className="group rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] p-6 text-center transition hover:-translate-y-1 hover:bg-white/[0.05]">
      <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-[var(--tk-raised)]">
        {imageOf(post) ? <img src={imageOf(post)} alt={post.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><UserRound className="h-8 w-8 text-[var(--tk-muted)]" /></div>}
      </div>
      <h2 className="mt-5 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h2>
      {role ? <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
      <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{summaryOf(post)}</p>
    </Link>
  )
}
