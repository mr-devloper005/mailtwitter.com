import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Manrope', system-ui, sans-serif"
const BODY_FONT = "'DM Sans', system-ui, sans-serif"

const base = {
  dark: true,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#F5E9D8',
  surface: '#F5E9D8',
  raised: 'rgba(47, 164, 215, 0.12)',
  text: '#3E2C23',
  muted: '#6B5342',
  line: 'rgba(62, 44, 35, 0.22)',
  accent: '#1C6E93',
  accentSoft: 'rgba(231, 111, 46, 0.2)',
  onAccent: '#1B140D',
  glow: 'rgba(62, 44, 35, 0.22)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Articles', note: 'Popular stories, thoughtful reads, and timely ideas.' },
  listing: { ...base, kicker: 'Listings', note: 'Explore featured vendors, services, and useful local leads.' },
  classified: { ...base, kicker: 'Classifieds', note: 'Fast-moving offers and practical notices.' },
  image: { ...base, kicker: 'Gallery', note: 'Visual posts curated for discovery and mood.' },
  sbm: { ...base, kicker: 'Bookmarks', note: 'Useful links arranged as a compact resource board.' },
  pdf: { ...base, kicker: 'Documents', note: 'Guides and files presented like a modern archive shelf.' },
  profile: { ...base, kicker: 'Profiles', note: 'People and businesses with stronger identity cues.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-fill': '#E76F2E',
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--tk-scrim-text': '#F5E9D8',
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': '#E76F2E',
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
