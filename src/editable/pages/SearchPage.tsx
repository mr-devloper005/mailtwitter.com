import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const searchPageStyle = {
  '--tk-bg': '#F5E9D8',
  '--tk-surface': '#F5E9D8',
  '--tk-raised': 'rgba(47, 164, 215, 0.12)',
  '--tk-text': '#3E2C23',
  '--tk-muted': '#6B5342',
  '--tk-line': 'rgba(62, 44, 35, 0.22)',
  '--tk-accent': '#1C6E93',
  '--tk-accent-soft': 'rgba(231, 111, 46, 0.2)',
  '--tk-on-accent': '#1B140D',
} as CSSProperties

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || '/placeholder.svg?height=900&width=1200'
}
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const strong = index % 5 === 0

  return (
    <Link href={href} className={`group overflow-hidden rounded-[1.9rem] border border-[var(--tk-line)] bg-white/[0.03] transition hover:-translate-y-1 hover:bg-white/[0.05] ${strong ? 'md:col-span-2' : ''}`}>
      <div className={`relative overflow-hidden ${strong ? 'aspect-[16/8]' : 'aspect-[16/11]'}`}>
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.0),rgba(0,0,0,0.82))]" />
        <span className="absolute left-4 top-4 rounded-full bg-white/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--tk-text)]">
          {taskLabel}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <h2 className="line-clamp-3 text-2xl font-extrabold leading-[1.02] tracking-[-0.05em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h2>
        {summary ? <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{summary}</p> : null}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-text)]">
          Open result <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)
  const featured = results[0]
  const spotlight = results.slice(1, 5)
  const gridResults = featured ? results.slice(1) : results

  return (
    <EditableSiteShell>
      <main style={searchPageStyle} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <section className="border-b border-[var(--tk-line)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--tk-accent)]">{pagesContent.search.hero.badge}</p>
                <h1 className="editable-display mt-4 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-[4rem]">
                  {pagesContent.search.hero.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--tk-muted)]">{pagesContent.search.hero.description}</p>
              </div>
              <form action="/search" className="rounded-[2rem] border border-[var(--tk-line)] bg-white/[0.03] p-5">
                <input type="hidden" name="master" value="1" />
                <label className="flex items-center gap-3 rounded-full bg-white/65 px-4 py-3">
                  <Search className="h-4 w-4 text-[var(--tk-accent)]" />
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder={pagesContent.search.hero.placeholder}
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--tk-text)] outline-none placeholder:text-[var(--tk-muted)]"
                  />
                </label>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-white/60 px-4 py-3">
                    <Filter className="h-4 w-4 text-[var(--tk-accent)]" />
                    <input name="category" defaultValue={category} placeholder="Category" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--tk-text)] outline-none placeholder:text-[var(--tk-muted)]" />
                  </label>
                  <select name="task" defaultValue={task} className="rounded-full border border-[var(--tk-line)] bg-white/60 px-4 py-3 text-sm font-semibold text-[var(--tk-text)] outline-none">
                    <option value="">All content types</option>
                    {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                  </select>
                </div>
                <button className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--tk-accent)] px-6 text-sm font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95" type="submit">
                  Search
                </button>
              </form>
            </div>

            <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--tk-accent)]">{results.length} results</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.05em] text-[var(--tk-text)]">{query ? `Results for "${query}"` : pagesContent.search.resultsTitle}</h2>
              </div>
              <Link href="/article" className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-white/45 px-5 py-3 text-sm font-bold text-[var(--tk-text)] transition hover:border-[var(--tk-accent-fill,var(--tk-accent))] hover:text-[var(--tk-text)]">
                Browse latest <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {featured ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <SearchResultCard post={featured} index={0} />
                <div className="space-y-4">
                  {spotlight.map((post, index) => (
                    <Link key={post.id || post.slug || post.title} href={`${SITE_CONFIG.tasks.find((item) => item.key === (getPostTaskKey(post) as TaskKey | null))?.route || '/article'}/${post.slug}`} className="group flex items-start gap-4 rounded-[1.6rem] border border-[var(--tk-line)] bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]">
                      <span className="editable-display text-4xl font-extrabold leading-none text-[var(--tk-muted)]">{index + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{SITE_CONFIG.tasks.find((item) => item.key === (getPostTaskKey(post) as TaskKey | null))?.label || 'Post'}</p>
                        <h3 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--tk-text)] group-hover:text-[var(--tk-accent-fill,var(--tk-accent))]">{post.title}</h3>
                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{summaryOf(post)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot="in-feed" showLabel eager className="mx-auto w-full" />
          </div>

          {results.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {gridResults.map((post, index) => <SearchResultCard key={post.id || post.slug || `${post.title}-${index}`} post={post} index={index + 1} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--tk-line)] bg-white/[0.03] p-10 text-center">
              <p className="text-3xl font-extrabold tracking-[-0.04em] text-[var(--tk-text)]">No matching posts found.</p>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Try a different keyword, task type, or category.</p>
            </div>
          )}
        </section>
      </main>
    </EditableSiteShell>
  )
}
