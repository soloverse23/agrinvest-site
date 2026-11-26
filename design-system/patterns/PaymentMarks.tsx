/**
 * Marks the card acquirer (ING WebPay) asks for: the Visa and Mastercard acceptance marks and
 * the ANPC alternative dispute resolution (SAL) pictogram. Each mark sits on a white chip, as
 * the card brands require, so it reads on the forest footer as well as on paper.
 * Server-safe: no hooks, usable from client components too.
 */

const chip =
  'inline-flex h-8 items-center justify-center rounded-sm bg-raised px-2 ring-1 ring-line'

/** Visa and Mastercard, in that order. The list is labelled for screen readers. */
export function CardMarks({ label, className = '' }: { label: string; className?: string }) {
  return (
    <ul aria-label={label} className={`flex items-center gap-2 ${className}`}>
      <li className={chip}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB SVG, nothing to optimise */}
        <img
          src="/brand/payments/visa.svg"
          alt="Visa"
          width={40}
          height={13}
          className="h-3.5 w-auto"
        />
      </li>
      <li className={chip}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB SVG, nothing to optimise */}
        <img
          src="/brand/payments/mastercard.svg"
          alt="Mastercard"
          width={34}
          height={21}
          className="h-5 w-auto"
        />
      </li>
    </ul>
  )
}

/** The ANPC SAL pictogram, linked to ANPC's complaints portal (Order ANPC 449/2022). */
export function AnpcMarks({ salLabel }: { salLabel: string }) {
  return (
    <a
      href="https://reclamatiisal.anpc.ro/"
      rel="noopener"
      className="inline-flex w-fit rounded-sm bg-raised p-1 ring-1 ring-line"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a 7 KB pictogram, fixed size */}
      <img
        src="/brand/payments/anpc-sal.webp"
        alt={salLabel}
        width={201}
        height={50}
        loading="lazy"
        className="h-10 w-auto"
      />
    </a>
  )
}
