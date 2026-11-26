/**
 * Records one guide video per department of the organisation chart (`public/panel/ghid-<role>.mp4` and a poster), in
 * Romanian, on a local dev server, signed in as that department. Captions, a visible cursor
 * and title cards are drawn on the page. Every value changed on camera is put back at the end.
 *
 *   PANEL_ACCOUNTS=/path/accounts.json node scripts/panel/record-guide.mjs [role …]
 *
 * `accounts.json`: [{ "username": "cereale", "password": "…" }, …] (the `ifn` role signs in as
 * `financiar`), the
 * local passwords handed to the owner (never committed).
 * Needs `npm run dev` on port 3100 and the seeded local database. Writes the chapters to
 * `src/lib/panel/guide-videos.json`, which the panel home reads.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import ffmpeg from 'ffmpeg-static'
import { chromium } from 'playwright'

const BASE = process.env.PANEL_URL ?? 'http://localhost:3100'
const accounts = JSON.parse(readFileSync(process.env.PANEL_ACCOUNTS ?? '', 'utf8'))
const size = { width: 1280, height: 800 }
const root = new URL('../../', import.meta.url).pathname
const chaptersFile = join(root, 'src/lib/panel/guide-videos.json')

/* ---------------------------------------------------------------- one scenario per department */
/**
 * Steps: [kind, …args]; `chapter` starts a chapter with its caption. `open` / `openFirst` take
 * the fields the next steps change: they are read when the document opens and put back after
 * recording, so the local data ends as it was. Lists are the account's own (shared sections
 * show only the department's documents), so `openFirst` always opens one of theirs.
 */
const scenarios = {
  cereale: {
    title: 'Cereale',
    sub: 'Prețurile de achiziție, cererile fermierilor și paginile de cereale.',
    steps: [
      [
        'chapter',
        'Secțiunile tale',
        'În stânga: prețurile, cererile, paginile de cereale și bazele.',
      ],
      ['hoverNav', ['Prețuri de achiziție', 'Cereri', 'Pagini', 'Baze']],
      ['chapter', 'Prețul zilei', 'Deschide „Prețuri de achiziție”: cel mai nou preț e primul.'],
      ['nav', 'Prețuri de achiziție'],
      ['openFirst', ['price', 'status']],
      ['fill', 'price', '1190'],
      ['chapter', 'Îl pui pe site', 'Starea „Publicat” îl arată pe site; apoi „Salvează”.'],
      ['select', 'status', 'Publicat'],
      ['button', 'Salvează'],
      ['chapter', 'Un preț nou', 'Pentru o zi nouă: „Adaugă”, cultura, baza, prețul și data.'],
      ['nav', 'Prețuri de achiziție'],
      ['hover', 'Adaugă'],
      [
        'chapter',
        'Cererile fermierilor',
        'La „Cereri”: vânzări de cereale și depozitare. Schimbi starea și salvezi.',
      ],
      ['nav', 'Cereri'],
      ['openFirst', ['status', 'notes']],
      ['select', 'status', 'Contactat'],
      ['type', 'notes', 'Sunat, revine cu cantitatea.'],
      ['button', 'Salvează'],
      ['chapter', 'Paginile de cereale', 'La „Pagini” schimbi textul și apeși „Publică pe site”.'],
      ['nav', 'Pagini'],
      ['openFirst', ['summary']],
      ['type', 'summary', ' Actualizat azi.'],
      ['button', 'Salvează ciorna'],
      ['button', 'Publică pe site'],
    ],
  },
  comercial: {
    title: 'Comercial (magazin)',
    sub: 'Produsele magazinului, comenzile și cererile de inputuri.',
    steps: [
      ['chapter', 'Secțiunile tale', 'În stânga: comenzile, cererile și catalogul magazinului.'],
      ['hoverNav', ['Comenzi', 'Cereri', 'Produse', 'Categorii']],
      ['chapter', 'Ajungi la produs', 'Deschide „Produse” și caută produsul după nume.'],
      ['nav', 'Produse'],
      ['search', 'NaPeKhem S65'],
      ['open', 'NaPeKhem S65', ['summary']],
      ['chapter', 'Schimbi textul', 'Rezumatul și descrierea sunt în fila „Produs”.'],
      ['type', 'summary', ' Disponibil din stoc.'],
      [
        'chapter',
        'Salvezi și publici',
        '„Salvează ciorna” păstrează lucrul; „Publică pe site” îl arată.',
      ],
      ['button', 'Salvează ciorna'],
      ['button', 'Publică pe site'],
      ['chapter', 'O comandă', 'La „Comenzi” deschizi comanda și îi schimbi starea.'],
      ['nav', 'Comenzi'],
      ['openFirst', ['status', 'staffNotes']],
      ['select', 'status', 'Contactat'],
      ['chapter', 'Notița și salvarea', 'Scrii o notiță pentru colegi și apeși „Salvează”.'],
      ['type', 'staffNotes', 'Sunat clientul, confirmă mâine.'],
      ['button', 'Salvează'],
    ],
  },
  ifn: {
    title: 'Financiar (IFN)',
    sub: 'Cererile de credit și textele produselor de finanțare.',
    steps: [
      [
        'chapter',
        'Secțiunile tale',
        'Sus: cererile de credit. Dedesubt: oferta, ghidurile și paginile.',
      ],
      ['hoverNav', ['Cereri de credit', 'Produse de finanțare', 'Întrebări']],
      ['chapter', 'O cerere de credit', 'Deschide „Cereri de credit”: cele noi sunt primele.'],
      ['nav', 'Cereri de credit'],
      ['openFirst', ['status', 'notes']],
      ['select', 'status', 'Contactat'],
      ['chapter', 'Notița și salvarea', 'După apel: schimbi starea, scrii o notiță, „Salvează”.'],
      ['type', 'notes', 'Sunat, trimite actele până vineri.'],
      ['button', 'Salvează'],
      ['chapter', 'Textul unui produs', 'La „Produse de finanțare” schimbi textul produsului.'],
      ['nav', 'Produse de finanțare'],
      ['openFirst', ['answer']],
      ['type', 'answer', ' Răspundem în aceeași zi.'],
      [
        'chapter',
        'Salvezi și publici',
        'Ciorna rămâne în panou; „Publică pe site” o arată vizitatorilor.',
      ],
      ['button', 'Salvează ciorna'],
      ['button', 'Publică pe site'],
    ],
  },
  logistica: {
    title: 'Logistică',
    sub: 'Cererile de transport și paginile de logistică.',
    steps: [
      ['chapter', 'Secțiunile tale', 'În stânga: cererile de transport și paginile tale.'],
      ['hoverNav', ['Cereri', 'Pagini']],
      [
        'chapter',
        'O cerere de transport',
        'Deschide „Cereri”: vezi telefonul, emailul și mesajul.',
      ],
      ['nav', 'Cereri'],
      ['openFirst', ['status', 'notes']],
      ['select', 'status', 'Contactat'],
      ['chapter', 'Notița și salvarea', 'După apel: starea, o notiță, apoi „Salvează”.'],
      ['type', 'notes', 'Sunat, camionul pleacă joi.'],
      ['button', 'Salvează'],
      ['chapter', 'Paginile de logistică', 'La „Pagini” schimbi textul paginii.'],
      ['nav', 'Pagini'],
      ['openFirst', ['summary']],
      ['type', 'summary', ' Actualizat azi.'],
      [
        'chapter',
        'Salvezi și publici',
        '„Salvează ciorna” păstrează lucrul; „Publică pe site” îl arată.',
      ],
      ['button', 'Salvează ciorna'],
      ['button', 'Publică pe site'],
    ],
  },
  motorina: {
    title: 'Motorină',
    sub: 'Prețul motorinei și cererile de motorină.',
    steps: [
      ['chapter', 'Secțiunile tale', 'În stânga: prețul motorinei și cererile de motorină.'],
      ['hoverNav', ['Prețuri motorină', 'Cereri']],
      ['chapter', 'Prețul motorinei', 'Deschide „Prețuri motorină”: cel mai nou preț e primul.'],
      ['nav', 'Prețuri motorină'],
      ['openFirst', ['price', 'status']],
      ['fill', 'price', '6.85'],
      ['chapter', 'Îl pui pe site', 'Starea „Publicat” îl arată pe site; apoi „Salvează”.'],
      ['select', 'status', 'Publicat'],
      ['button', 'Salvează'],
      [
        'chapter',
        'Un preț nou',
        'Pentru un preț nou: „Adaugă”, prețul și data de la care e valabil.',
      ],
      ['nav', 'Prețuri motorină'],
      ['hover', 'Adaugă'],
      [
        'chapter',
        'Cererile de motorină',
        'La „Cereri”: cantitatea și data livrării. Schimbi starea și salvezi.',
      ],
      ['nav', 'Cereri'],
      ['openFirst', ['status', 'notes']],
      ['select', 'status', 'Contactat'],
      ['type', 'notes', 'Confirmat, livrare marți.'],
      ['button', 'Salvează'],
    ],
  },
  continut: {
    title: 'Conținut',
    sub: 'Cum ajungi la un articol, îl schimbi și îl publici.',
    steps: [
      [
        'chapter',
        'Secțiunile tale',
        'În stânga: paginile tale, articolele și știrile, echipa și postările.',
      ],
      ['hoverNav', ['Pagini', 'Articole și ghiduri', 'Persoane']],
      ['chapter', 'Ajungi la articol', 'Deschide „Articole și ghiduri” și caută după titlu.'],
      ['nav', 'Articole și ghiduri'],
      ['search', 'erbicidarea porumbului'],
      ['open', 'Erbicidarea porumbului', ['summary']],
      ['chapter', 'Schimbi textul', 'Scrii direct în câmpuri, ca într-un document.'],
      ['type', 'summary', ' Actualizat în noiembrie.'],
      [
        'chapter',
        'Salvezi ciorna',
        '„Salvează ciorna” păstrează lucrul. Pe site nu se schimbă încă.',
      ],
      ['button', 'Salvează ciorna'],
      [
        'chapter',
        'Publici pe site',
        '„Publică pe site”: vizitatorii văd textul în câteva secunde.',
      ],
      ['button', 'Publică pe site'],
      ['chapter', 'Versiunea în engleză', 'Engleza: „Limba”, sus în dreapta, apoi English.'],
      ['english'],
      [
        'chapter',
        'Mai rapid: linkul de pe site',
        'Pe pagina de start lipești linkul văzut pe site și intri direct.',
      ],
      ['home'],
      ['finder', 'agrinvest.ro/despre'],
    ],
  },
}

/* ---------------------------------------------------------------- page overlay */
const overlay = () => {
  const css = `nextjs-portal{display:none!important}
  #rec-cap{position:fixed;left:300px;bottom:28px;z-index:99999;display:flex;gap:14px;align-items:center;max-width:600px;padding:14px 22px 14px 14px;border-radius:16px;background:rgba(15,59,41,.96);color:#fff;font:600 21px/1.35 'Onest Variable',system-ui,sans-serif;box-shadow:0 18px 40px -12px rgba(0,0,0,.45);transition:opacity .35s;opacity:0}
  #rec-cap b{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:999px;background:#b9dc5a;color:#0f3b29;font-size:20px}
  #rec-cur{position:fixed;z-index:100000;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:999px;background:rgba(18,120,74,.35);border:2px solid #12784a;pointer-events:none;transition:transform .12s}
  #rec-cur.down{transform:scale(.7);background:rgba(185,220,90,.8)}
  #rec-card{position:fixed;inset:0;z-index:100001;display:grid;place-content:center;gap:16px;text-align:center;background:radial-gradient(120% 140% at 100% 0%,rgba(185,220,90,.22),transparent 55%),linear-gradient(135deg,#0f3b29,#17492f);color:#fff;font-family:'Onest Variable',system-ui,sans-serif;transition:opacity .5s}
  #rec-card h1{margin:0;font-size:58px;letter-spacing:-.02em}
  #rec-card p{margin:0;color:#b7c8bb;font-size:24px}
  #rec-card span{justify-self:center;padding:6px 16px;border-radius:999px;background:#b9dc5a;color:#0f3b29;font-weight:700;font-size:18px}`
  const add = () => {
    if (document.getElementById('rec-cap')) return
    const style = document.createElement('style')
    style.textContent = css
    document.head.append(style)
    const cap = document.createElement('div')
    cap.id = 'rec-cap'
    const cur = document.createElement('div')
    cur.id = 'rec-cur'
    document.body.append(cap, cur)
    const pos = sessionStorage.getItem('rec-cur')
    if (pos) [cur.style.left, cur.style.top] = JSON.parse(pos)
    addEventListener('mousemove', (e) => {
      cur.style.left = `${e.clientX}px`
      cur.style.top = `${e.clientY}px`
      sessionStorage.setItem('rec-cur', JSON.stringify([cur.style.left, cur.style.top]))
    })
    addEventListener('mousedown', () => cur.classList.add('down'))
    addEventListener('mouseup', () => cur.classList.remove('down'))
    const saved = sessionStorage.getItem('rec-cap')
    if (saved) window.__cap(...JSON.parse(saved))
  }
  window.__cap = (n, text) => {
    sessionStorage.setItem('rec-cap', JSON.stringify([n, text]))
    const cap = document.getElementById('rec-cap')
    if (!cap) return
    cap.innerHTML = `<b>${n}</b><span>${text}</span>`
    cap.style.opacity = '1'
  }
  window.__nocap = () => {
    sessionStorage.removeItem('rec-cap')
    const cap = document.getElementById('rec-cap')
    if (cap) cap.style.opacity = '0'
  }
  window.__card = (kicker, title, sub) => {
    document.getElementById('rec-card')?.remove()
    const card = document.createElement('div')
    card.id = 'rec-card'
    card.innerHTML = `<span>${kicker}</span><h1>${title}</h1><p>${sub}</p>`
    document.body.append(card)
  }
  window.__uncard = () => {
    const card = document.getElementById('rec-card')
    if (!card) return
    card.style.opacity = '0'
    setTimeout(() => card.remove(), 500)
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', add)
  else add()
}

/* ---------------------------------------------------------------- recording */
async function record(browser, role) {
  const scenario = scenarios[role]
  const username = role === 'ifn' ? 'financiar' : role
  const account = accounts.find((a) => a.username === username)
  if (!account) throw new Error(`No account for ${role} in PANEL_ACCOUNTS`)

  const login = await browser.newContext({ viewport: size })
  const lp = await login.newPage()
  const res = await lp.request.post(`${BASE}/api/users/login`, {
    data: account.username
      ? { username: account.username, password: account.password }
      : { email: account.email, password: account.password },
  })
  if (!res.ok()) throw new Error(`${role}: login failed (${res.status()})`)
  // The panel remembers the content language per account: start in Romanian.
  await lp.goto(`${BASE}/admin?locale=ro`)
  await lp.waitForSelector('.panel-hero')

  // What the video changes: read when each document opens (`remember`).
  const saved = []
  const state = await login.storageState()
  await login.close()

  const dir = mkdtempSync(join(tmpdir(), `panel-guide-${role}-`))
  const ctx = await browser.newContext({
    viewport: size,
    storageState: state,
    recordVideo: { dir, size },
  })
  await ctx.addInitScript(overlay)
  const page = await ctx.newPage()
  const t0 = Date.now()
  const chapters = []
  const wait = (ms) => page.waitForTimeout(ms)
  const moveTo = async (locator) => {
    await locator.scrollIntoViewIfNeeded().catch(() => {})
    const box = await locator.boundingBox()
    if (!box) return
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 26 })
  }
  const click = async (locator) => {
    await moveTo(locator)
    await wait(250)
    await locator.click()
  }
  // The opened document's fields, as they are before the video changes them.
  const remember = async (fields) => {
    const match = new URL(page.url()).pathname.match(/\/collections\/([^/]+)\/(\d+)/)
    if (!match || !fields?.length) return
    const [, collection, id] = match
    const r = await page.request.get(`${BASE}/api/${collection}/${id}?depth=0&draft=true&locale=ro`)
    const doc = await r.json()
    saved.push({
      collection,
      id,
      data: Object.fromEntries(fields.map((f) => [f, doc[f] ?? null])),
      status: doc._status ?? null,
    })
  }
  const settle = async () => {
    await page.waitForLoadState('networkidle').catch(() => {})
    await wait(900)
  }

  await page.goto(`${BASE}/admin`)
  await page.evaluate(
    ([title, sub]) => window.__card('Ghid video · Agrinvest', title, sub),
    [scenario.title, scenario.sub],
  )
  await page.waitForSelector('.panel-hero')
  await page.mouse.move(640, 420)
  await wait(3200)
  await page.evaluate(() => window.__uncard())
  await wait(500)

  for (const [kind, a, b] of scenario.steps) {
    switch (kind) {
      case 'chapter':
        chapters.push({ at: Math.round((Date.now() - t0) / 1000), label: a })
        await page.evaluate(([n, t]) => window.__cap(n, t), [chapters.length, b])
        await wait(1100)
        break
      case 'hoverNav':
        for (const name of a) {
          await moveTo(page.locator('.panel-nav__link', { hasText: name }).first())
          await wait(550)
        }
        await wait(600)
        break
      case 'nav':
        await click(page.locator('.panel-nav__link', { hasText: a }).first())
        await settle()
        await wait(700)
        break
      case 'search': {
        const input = page.locator('.search-filter__input').first()
        await click(input)
        await input.pressSequentially(a, { delay: 70 })
        await wait(2000)
        break
      }
      case 'open':
        await click(page.locator('.table a', { hasText: a }).first())
        await settle()
        await remember(b)
        await page.evaluate(() => window.scrollTo(0, 0))
        await wait(900)
        break
      case 'openFirst':
        await click(page.locator('.table tbody tr a').first())
        await settle()
        await remember(a)
        await page.evaluate(() => window.scrollTo(0, 0))
        await wait(900)
        break
      case 'type': {
        const field = page.locator(`textarea[name="${a}"], input[name="${a}"]`).first()
        await click(field)
        await page.keyboard.press('Meta+ArrowDown')
        await page.keyboard.press('End')
        await page.keyboard.type(b, { delay: 60 })
        await wait(900)
        break
      }
      case 'fill': {
        const field = page.locator(`input[name="${a}"]`).first()
        await click(field)
        await page.keyboard.press('Meta+A')
        await page.keyboard.type(b, { delay: 120 })
        await wait(900)
        break
      }
      case 'select': {
        await click(page.locator(`#field-${a} .rs__control`).first())
        await wait(600)
        const option = page.locator('.rs__option', { hasText: b }).first()
        await moveTo(option)
        await wait(400)
        await option.click()
        await wait(900)
        break
      }
      case 'button': {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
        await wait(600)
        await click(page.getByRole('button', { name: a, exact: true }).first())
        await wait(2600)
        break
      }
      case 'hover':
        await moveTo(page.getByText(a, { exact: true }).first())
        await wait(2200)
        break
      case 'english': {
        await click(page.locator('.localizer button').first())
        await wait(800)
        const english = page.locator('.popup-button-list__button', { hasText: 'English' }).first()
        await moveTo(english)
        await wait(400)
        await english.click()
        await settle()
        await wait(2200)
        // And back to Romanian, the way staff will usually work.
        await click(page.locator('.localizer button').first())
        await wait(600)
        await page.locator('.popup-button-list__button', { hasText: 'Română' }).first().click()
        await settle()
        break
      }
      case 'home':
        await click(page.locator('.panel-nav__link', { hasText: 'Acasă' }).first())
        await settle()
        break
      case 'finder': {
        const finder = page.locator('.panel-finder__input')
        await click(finder)
        await finder.pressSequentially(a, { delay: 65 })
        await page.waitForSelector('.panel-finder__results li', { timeout: 20000 }).catch(() => {})
        await moveTo(page.locator('.panel-finder__results li a').first())
        await wait(2200)
        break
      }
    }
  }
  await page.evaluate(() => window.__nocap())
  await page.evaluate(() =>
    window.__card('Gata', 'Asta e tot.', 'Ghidul scris e sub video, pe pagina de start.'),
  )
  await wait(3000)
  const video = page.video()
  await ctx.close()
  const webm = await video.path()

  // Put back every value the video changed, in Romanian, as it was; and Romanian as the language.
  const cleanup = await browser.newContext({ storageState: state })
  for (const s of saved) {
    const data = { ...s.data, ...(s.status ? { _status: s.status } : {}) }
    const r = await cleanup.request.patch(`${BASE}/api/${s.collection}/${s.id}?locale=ro`, { data })
    if (!r.ok()) console.error(`${role}: could not restore ${s.collection} ${s.id}: ${r.status()}`)
  }
  const reset = await cleanup.newPage()
  await reset.goto(`${BASE}/admin?locale=ro`)
  await cleanup.close()

  const out = join(root, 'public/panel')
  mkdirSync(out, { recursive: true })
  const mp4 = join(out, `ghid-${role}.mp4`)
  execFileSync(
    ffmpeg,
    [
      '-y',
      '-i',
      webm,
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '27',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      mp4,
    ],
    { stdio: 'ignore' },
  )
  execFileSync(
    ffmpeg,
    [
      '-y',
      '-ss',
      String((chapters[1]?.at ?? 6) + 2),
      '-i',
      mp4,
      '-frames:v',
      '1',
      '-q:v',
      '4',
      join(out, `ghid-${role}.jpg`),
    ],
    { stdio: 'ignore' },
  )
  return chapters
}

const roles = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(scenarios)
const all = existsSync(chaptersFile) ? JSON.parse(readFileSync(chaptersFile, 'utf8')) : {}
const browser = await chromium.launch()
for (const role of roles) {
  all[role] = { title: scenarios[role].title, chapters: await record(browser, role) }
  writeFileSync(chaptersFile, `${JSON.stringify(all, null, 2)}\n`)
  console.log(`${role}: ${all[role].chapters.length} chapters`)
}
await browser.close()
