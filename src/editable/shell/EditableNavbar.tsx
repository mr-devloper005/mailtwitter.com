'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogIn, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () => SITE_CONFIG.tasks
      .filter((task) => task.enabled && task.key !== 'listing' && task.key !== 'classified' && task.key !== 'profile')
      .map((task) => ({ label: task.label, href: task.route })),
    []
  )

  const primaryItems = [
    { label: 'Home', href: '/' },
    ...navItems.slice(0, 5),
    { label: 'More', href: '/search' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)] shadow-[0_18px_40px_rgba(62,44,35,0.24)] backdrop-blur-md">
      <div className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-[var(--editable-container)] items-center justify-end gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--editable-nav-text)] sm:px-6 lg:px-8">
          <Link href={globalContent.nav.actions.primary.href} className="rounded-full px-3 py-1 transition hover:bg-white/10 hover:text-[var(--slot4-warm)]">
            {globalContent.nav.actions.primary.label}
          </Link>
          {session ? (
            <button type="button" onClick={logout} className="rounded-full bg-[var(--slot4-warm)] px-3 py-1 text-[var(--slot4-on-accent)] transition hover:brightness-95">
              Log out
            </button>
          ) : (
            <span className="rounded-full border border-white/15 px-3 py-1 text-[var(--slot4-warm)]">
              Member access
            </span>
          )}
        </div>
      </div>

      <nav className="mx-auto flex min-h-[96px] max-w-[var(--editable-container)] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-4">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,var(--slot4-warm),var(--slot4-media-bg))] shadow-[0_12px_28px_rgba(62,44,35,0.32)] ring-1 ring-white/25">
            <span className="absolute inset-[5px] rounded-[1.2rem] bg-[var(--slot4-cream)]" />
            <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-[0.95rem] bg-[var(--slot4-accent-soft)] ring-1 ring-[var(--editable-border)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-6 w-6 object-contain mix-blend-multiply" />
            </span>
          </span>
          <div className="min-w-0">
            <span className="editable-display block text-[2.4rem] font-extrabold leading-none tracking-[-0.08em] text-[var(--editable-nav-text)]">
              {SITE_CONFIG.name}
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">
              {globalContent.nav.tagline || SITE_CONFIG.tagline}
            </span>
          </div>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {primaryItems.map((item) => {
            const active = isActive(pathname, item.href)
            const more = item.label === 'More'
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  active
                    ? 'bg-[var(--editable-nav-active)] text-[var(--editable-nav-active-text)]'
                    : 'text-[var(--editable-nav-text)] hover:bg-white/10 hover:text-[var(--slot4-warm)]'
                }`}
              >
                {item.label}
                {more ? <ChevronDown className="h-4 w-4" /> : null}
              </Link>
            )
          })}
        </div>

        <form action="/search" className="hidden min-w-0 max-w-[230px] flex-1 xl:flex">
          <label className="flex w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-[var(--editable-nav-text)] focus-within:border-[var(--slot4-warm)]">
            <Search className="h-4 w-4 shrink-0 text-[var(--slot4-warm)]" />
            <input
              name="q"
              type="search"
              placeholder="Search the site"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/60"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <Link
              href="/create"
              className="hidden items-center gap-2 rounded-full bg-[var(--slot4-warm)] px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--slot4-on-accent)] transition hover:-translate-y-0.5 hover:brightness-95 sm:inline-flex"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Add Listing
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-full border border-white/40 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--editable-nav-text)] transition hover:border-[var(--slot4-warm)] hover:text-[var(--slot4-warm)] sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Log in
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 rounded-full bg-[var(--slot4-warm)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--slot4-on-accent)] transition hover:brightness-95 sm:inline-flex"
              >
                <UserPlus className="h-3.5 w-3.5" /> Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-white/25 bg-white/10 p-2.5 text-[var(--editable-nav-text)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-page-bg)] px-4 py-5 lg:hidden">
          <form action="/search" className="mb-5">
            <label className="flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-4 py-2.5">
              <Search className="h-4 w-4 text-[var(--slot4-accent)]" />
              <input name="q" type="search" placeholder="Search the site" className="min-w-0 flex-1 bg-transparent text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-soft-muted-text)]" />
            </label>
          </form>
          <div className="grid gap-2">
            {primaryItems
              .concat(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Log in', href: '/login' }, { label: 'Sign up', href: '/signup' }])
              .map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? 'bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)]'
                        : 'bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)] hover:bg-[var(--slot4-accent-soft)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
          </div>
        </div>
      ) : null}
    </header>
  )
}
