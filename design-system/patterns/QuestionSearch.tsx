/**
 * Filters the questions index as the farmer types (Phase 7g). The list is server-rendered and
 * complete; a small inline script hides the `[data-question]` items that do not match and the
 * topics (`[data-topic]`) left empty, ignoring case and diacritics ("garantii" finds
 * "Garanții"). It costs no client bundle (the 160 KB script budget); without JavaScript every
 * question stays listed. Server component.
 */
const script = (id: string) =>
  `(function(){var i=document.getElementById(${JSON.stringify(id)}),s=document.getElementById(${JSON.stringify(`${id}-status`)});if(!i)return;` +
  `function f(t){return t.toLowerCase().normalize('NFD').replace(/\\p{Diacritic}/gu,'')}` +
  `i.addEventListener('input',function(){var q=f(i.value.trim()),n=0;document.querySelectorAll('[data-topic]').forEach(function(g){var k=0;` +
  `g.querySelectorAll('[data-question]').forEach(function(e){var m=!q||f(e.getAttribute('data-question')||'').indexOf(q)>-1;e.hidden=!m;if(m)k++});` +
  `g.hidden=k===0;n+=k});s.textContent=n?'':s.getAttribute('data-empty')})})()`

export function QuestionSearch({
  id = 'cauta-intrebare',
  label,
  placeholder,
  empty,
}: {
  id?: string
  label: string
  placeholder: string
  empty: string
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-small font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 w-full rounded-md border border-field-line bg-raised px-4 text-body text-ink placeholder:text-subtle hover:border-ink focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15 focus-visible:outline-none"
      />
      <p
        id={`${id}-status`}
        role="status"
        data-empty={empty}
        className="min-h-5 text-small text-muted"
      />
      <script dangerouslySetInnerHTML={{ __html: script(id) }} />
    </div>
  )
}
