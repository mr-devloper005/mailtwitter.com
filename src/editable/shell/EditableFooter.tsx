'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="border-t border-[var(--editable-border)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="border-b border-[var(--editable-border)] pb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-4">
              <span className="relative flex h-14 w-14 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(255,251,167,0.95),rgba(255,166,251,0.78))] shadow-[0_12px_28px_rgba(255,97,248,0.22)] ring-1 ring-white/50">
                <span className="absolute inset-[5px] rounded-[1.2rem] bg-white/85" />
                <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-[0.95rem] bg-[rgba(255,234,108,0.22)] ring-1 ring-[var(--editable-border)]">
                  <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-6 w-6 object-contain mix-blend-multiply" />
                </span>
              </span>
              <div>
                <span className="editable-display block text-4xl font-extrabold leading-none tracking-[-0.08em] text-[var(--editable-footer-text)]">{SITE_CONFIG.name}</span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">{globalContent.footer.tagline}</span>
              </div>
            </Link>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--slot4-muted-text)]">{globalContent.footer.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-[var(--editable-cta-bg)] px-5 py-3 text-sm font-extrabold text-[var(--editable-cta-text)] transition hover:-translate-y-0.5">
                Add your listing
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-5 py-3 text-sm font-bold text-[var(--editable-footer-text)] transition hover:border-[var(--slot4-accent-fill)] hover:text-[var(--editable-footer-text)]">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr]">
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Site Content</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ['Home', '/'],
                ['Articles', '/article'],
                ['Search', '/search'],
                ['About', '/about'],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="text-sm font-semibold text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent-fill)]">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Account</h3>
            <div className="mt-5 grid gap-3">
              {session ? (
                <>
                  <button type="button" onClick={logout} className="text-left text-sm font-semibold text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent-fill)]">Log out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent-fill)]">Log in</Link>
                  <Link href="/signup" className="text-sm font-semibold text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent-fill)]">Sign up</Link>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">About this site</h3>
            <p className="mt-5 text-sm leading-7 text-[var(--slot4-muted-text)]">{globalContent.footer.bottomNote}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--editable-border)] px-4 py-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-soft-muted-text)]">
        © {year} {SITE_CONFIG.name}. All rights reserved.
      </div>
    </footer>
  )
}
