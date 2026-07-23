import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowUpRight, Bookmark, Download, ExternalLink, FileText,
  Globe2, Mail, MapPin, Phone, Star, Tag, UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const fieldOf = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const imagesOf = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && Boolean(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && Boolean(url)) : []
  const single = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter(Boolean)
  return [...media, ...images, ...single].filter(Boolean)
}

const bodyOf = (post: SitePost) => asText(getContent(post).body) || asText(getContent(post).description) || asText(getContent(post).details) || post.summary || 'Details will appear here once available.'
const summaryOf = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || '')
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return value
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br />')}</p>`)
    .join('')
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

const detailAdSlotByTask: Partial<Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'>> = {
  article: 'article-bottom',
  listing: 'sidebar',
  profile: 'footer',
}

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-muted)] transition hover:text-[var(--tk-accent)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function DetailMeta({ post, category }: { post: SitePost; category?: string }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-bold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--tk-text)]">{category}</span> : null}
    </div>
  )
}

function hasUniqueBody(post: SitePost) {
  const bodyPlain = stripHtml(bodyOf(post)).toLowerCase()
  const summaryPlain = summaryOf(post).toLowerCase()
  if (!bodyPlain) return false
  return bodyPlain !== summaryPlain
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  if (!hasUniqueBody(post)) return null
  return (
    <div
      className={`article-content mt-8 max-w-none ${compact ? 'text-[15px] leading-7' : 'text-[1.03rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(bodyOf(post)) }}
    />
  )
}

function HeroBlock({ task, post, eyebrow }: { task: TaskKey; post: SitePost; eyebrow: string }) {
  const image = imagesOf(post)[0]
  return (
    <section className="border-b border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <BackLink task={task} />
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--tk-accent)]">{eyebrow}</p>
            <h1 className="editable-display mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-[4rem]">
              {post.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--tk-muted)]">{summaryOf(post) || 'Explore the full details below.'}</p>
            <DetailMeta post={post} category={fieldOf(post, ['category']) || categoryOf(post, eyebrow)} />
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-white/5">
            <img src={image || '/placeholder.svg?height=900&width=1200'} alt={post.title} className="aspect-[16/11] w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}

function DetailInfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.5rem] border border-[var(--tk-line)] bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--tk-accent)]"><Icon className="h-4 w-4" /> {label}</div>
          <p className="mt-2 break-words text-sm leading-7 text-[var(--tk-text)]">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ActionPanel({ website, phone, email }: { website?: string; phone?: string; email?: string }) {
  if (!website && !phone && !email) return null
  return (
    <div className="rounded-[1.7rem] border border-[var(--tk-line)] bg-white/[0.03] p-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--tk-accent)]">Quick actions</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {website ? <Link href={safeUrl(website)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95">Website <ExternalLink className="h-4 w-4" /></Link> : null}
        {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-extrabold transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
        {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-extrabold transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
      </div>
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  if (!related.length) return null
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="editable-display text-3xl font-extrabold tracking-[-0.04em]">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-text)] hover:text-[var(--tk-accent-fill,var(--tk-accent))]">
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug || item.title} task={task} post={item} />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.7rem] border border-[var(--tk-line)] bg-white/[0.03] transition hover:-translate-y-1 hover:bg-white/[0.05]">
      <img src={imagesOf(post)[0] || '/placeholder.svg?height=900&width=1200'} alt={post.title} className="aspect-[16/11] w-full object-cover" />
      <div className="p-4">
        <h3 className="line-clamp-2 text-lg font-extrabold leading-tight tracking-[-0.03em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{summaryOf(post)}</p>
      </div>
    </Link>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const popular = related.slice(0, 4)
  const adSlot = detailAdSlotByTask.article
  return (
    <>
      <HeroBlock task="article" post={post} eyebrow="Article" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0 rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-6 sm:p-8">
            <BodyContent post={post} />
            {adSlot ? (
              <div className="mx-auto max-w-6xl px-4 py-6">
                <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
              </div>
            ) : null}
            <EditableArticleComments slug={post.slug} comments={comments} />
          </article>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.7rem] border border-[var(--tk-line)] bg-white/[0.03] p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--tk-accent)]">Popular reads</p>
              <div className="mt-5 space-y-4">
                {popular.map((item, index) => (
                  <Link key={item.id || item.slug || item.title} href={`/article/${item.slug}`} className="group flex items-start gap-4 border-t border-[var(--tk-line)] pt-4 first:border-t-0 first:pt-0">
                    <span className="editable-display text-3xl font-extrabold text-[var(--tk-muted)]">{index + 1}</span>
                    <span className="line-clamp-3 text-base font-extrabold leading-6 tracking-[-0.02em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const address = fieldOf(post, ['address', 'location', 'city'])
  const phone = fieldOf(post, ['phone', 'telephone', 'mobile'])
  const email = fieldOf(post, ['email'])
  const website = fieldOf(post, ['website', 'url'])
  const adSlot = detailAdSlotByTask.listing
  const infoItems: Array<[string, string, typeof MapPin]> = [['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]
  const hasArticle = hasUniqueBody(post) || infoItems.some(([, value]) => value)
  return (
    <>
      <HeroBlock task="listing" post={post} eyebrow="Business listing" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className={hasArticle ? 'grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]' : 'mx-auto grid max-w-md gap-6'}>
          {hasArticle ? (
            <article className="min-w-0 rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-6 sm:p-8">
              <DetailInfoGrid items={infoItems} />
              <BodyContent post={post} />
            </article>
          ) : null}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {adSlot ? (
              <div className="mx-auto max-w-6xl px-4 py-6">
                <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
              </div>
            ) : null}
          </aside>
        </div>
      </section>
      <RelatedStrip task="listing" related={related} />
    </>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const price = fieldOf(post, ['price', 'amount', 'budget']) || 'Open offer'
  const location = fieldOf(post, ['location', 'address', 'city'])
  const phone = fieldOf(post, ['phone', 'telephone', 'mobile'])
  const email = fieldOf(post, ['email'])
  const website = fieldOf(post, ['website', 'url'])
  const showBody = hasUniqueBody(post)
  return (
    <>
      <HeroBlock task="classified" post={post} eyebrow="Classified" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className={showBody ? 'grid items-start gap-10 lg:grid-cols-[320px_minmax(0,1fr)]' : 'mx-auto grid max-w-2xl gap-6'}>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-white/[0.03] p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--tk-accent)]">Offer overview</p>
              <p className="editable-display mt-4 text-4xl font-extrabold tracking-[-0.05em] text-[var(--tk-accent)]">{price}</p>
              {location ? <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">{location}</p> : null}
            </div>
            <ActionPanel website={website} phone={phone} email={email} />
          </aside>
          {showBody ? (
            <article className="min-w-0 rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-6 sm:p-8">
              <BodyContent post={post} />
            </article>
          ) : null}
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const gallery = imagesOf(post)
  return (
    <>
      <HeroBlock task="image" post={post} eyebrow="Image story" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
          {(gallery.length ? gallery : ['/placeholder.svg?height=900&width=1200']).map((image, index) => (
            <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[1.7rem] border border-[var(--tk-line)] bg-white/[0.03]">
              <img src={image} alt={post.title} className="w-full object-cover" />
            </figure>
          ))}
        </div>
        {hasUniqueBody(post) ? (
          <div className="mt-8 rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-6 sm:p-8">
            <BodyContent post={post} compact />
          </div>
        ) : null}
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = fieldOf(post, ['website', 'url', 'link'])
  const showBody = hasUniqueBody(post)
  if (!website && !showBody) {
    return (
      <>
        <HeroBlock task="sbm" post={post} eyebrow="Saved resource" />
        <RelatedStrip task="sbm" related={related} />
      </>
    )
  }
  return (
    <>
      <HeroBlock task="sbm" post={post} eyebrow="Saved resource" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center gap-3 text-[var(--tk-accent)]"><Bookmark className="h-5 w-5" /> <span className="text-sm font-extrabold uppercase tracking-[0.16em]">Resource link</span></div>
          {website ? <Link href={safeUrl(website)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95">Open resource <ExternalLink className="h-4 w-4" /></Link> : null}
          <BodyContent post={post} />
        </div>
      </section>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = fieldOf(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const hasArticle = hasUniqueBody(post) || Boolean(fileUrl)
  return (
    <>
      <HeroBlock task="pdf" post={post} eyebrow="Document" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className={hasArticle ? 'grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]' : 'mx-auto grid max-w-md gap-6'}>
          {hasArticle ? (
          <article className="min-w-0 rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-6 sm:p-8">
            <BodyContent post={post} />
            {fileUrl ? (
              <div className="mt-8 overflow-hidden rounded-[1.7rem] border border-[var(--tk-line)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] bg-white/[0.03] p-4">
                  <span className="text-sm font-extrabold">Document preview</span>
                  <Link href={safeUrl(fileUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-extrabold text-[var(--tk-on-accent)]">Download <Download className="h-4 w-4" /></Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[72vh] w-full bg-[var(--tk-raised)]" />
              </div>
            ) : null}
          </article>
          ) : null}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <InfoCard title="Document notes" icon={FileText}>
              Open the document in a new tab or preview it directly here when a file URL is available.
            </InfoCard>
          </aside>
        </div>
      </section>
      <RelatedStrip task="pdf" related={related} />
    </>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = fieldOf(post, ['website', 'url'])
  const email = fieldOf(post, ['email'])
  const role = fieldOf(post, ['role', 'designation', 'company', 'location'])
  const image = imagesOf(post)[0]
  const adSlot = detailAdSlotByTask.profile
  return (
    <>
      <section className="border-b border-[var(--tk-line)]">
        <div className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
          <BackLink task="profile" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-center">
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-8 text-center">
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-[var(--tk-raised)]">
                {image ? <img src={image} alt={post.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><UserRound className="h-10 w-10 text-[var(--tk-muted)]" /></div>}
              </div>
              <h1 className="editable-display mt-6 text-3xl font-extrabold tracking-[-0.04em]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{role}</p> : null}
              <div className="mt-6">
                <ActionPanel website={website} email={email} />
              </div>
            </div>
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-6 sm:p-8">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--tk-accent)]">Profile</p>
              <h2 className="editable-display mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.05em]">{post.title}</h2>
              <DetailMeta post={post} category={role} />
              <BodyContent post={post} />
              {adSlot ? (
                <div className="mx-auto max-w-6xl px-4 py-6">
                  <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: typeof Tag; children: ReactNode }) {
  return (
    <div className="rounded-[1.7rem] border border-[var(--tk-line)] bg-white/[0.03] p-6">
      <div className="flex items-center gap-2 text-[var(--tk-accent)]"><Icon className="h-4 w-4" /> <span className="text-xs font-extrabold uppercase tracking-[0.18em]">{title}</span></div>
      <p className="mt-4 text-sm leading-7 text-[var(--tk-muted)]">{children}</p>
    </div>
  )
}
