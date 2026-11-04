import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Analytics } from '@/components/Analytics'
import { OPEN_EVENT } from '@/lib/consent'

vi.mock('next/script', () => ({
  // Render a marker instead of loading Google's script in tests.
  default: ({ id, src }: { id?: string; src?: string }) =>
    createElement('script', { 'data-testid': 'ga', 'data-id': id, 'data-src': src }),
}))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: unknown }) =>
    createElement('a', { href }, children as never),
}))

const mount = () =>
  render(
    createElement(Analytics, {
      gaId: 'G-TEST123',
      locale: 'ro',
      privacyHref: '/confidentialitate',
    }),
  )

const clearCookies = () => {
  for (const name of document.cookie.split('; ').map((c) => c.split('=')[0])) {
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`
  }
}

afterEach(() => {
  cleanup()
  clearCookies()
})

describe('consent and analytics', () => {
  it('asks first and loads nothing before a choice', () => {
    mount()
    expect(screen.getByRole('dialog', { name: 'Cookie-uri pentru statistici' })).toBeTruthy()
    expect(screen.queryAllByTestId('ga')).toHaveLength(0)
  })

  it('loads GA4 only after the visitor accepts, and remembers it', () => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }))
    expect(document.cookie).toContain('consent=granted')
    expect(screen.queryByRole('dialog')).toBeNull()
    const scripts = screen.getAllByTestId('ga')
    expect(scripts.some((s) => s.dataset.src?.includes('id=G-TEST123'))).toBe(true)
    cleanup()
    mount()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getAllByTestId('ga').length).toBeGreaterThan(0)
  })

  it('refusing loads nothing and removes Google Analytics cookies', () => {
    document.cookie = '_ga=GA1.1.123; Path=/'
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Refuz' }))
    expect(document.cookie).toContain('consent=denied')
    expect(document.cookie).not.toContain('_ga=')
    expect(screen.queryAllByTestId('ga')).toHaveLength(0)
  })

  it('the footer link reopens the banner to change the choice', () => {
    document.cookie = 'consent=denied; Path=/'
    mount()
    expect(screen.queryByRole('dialog')).toBeNull()
    act(() => {
      window.dispatchEvent(new Event(OPEN_EVENT))
    })
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('records a lead as generate_lead once consent is given', () => {
    document.cookie = 'consent=granted; Path=/'
    const gtag = vi.fn()
    window.gtag = gtag
    mount()
    act(() => {
      window.dispatchEvent(new CustomEvent('agrinvest:lead', { detail: { type: 'depozitare' } }))
    })
    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', { lead_type: 'depozitare' })
    delete window.gtag
  })
})
