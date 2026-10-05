import { useState } from 'react';
import { FAQ_HOME } from '@/content/site';

export default function FaqList({ items = FAQ_HOME, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="lab-glass divide-y divide-[var(--border)] rounded-[1.75rem]">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <button
            key={item.q}
            type="button"
            aria-expanded={expanded}
            onClick={() => setOpen(expanded ? -1 : index)}
            className="block w-full px-5 py-4 text-left"
          >
            <p className="font-outfit text-sm font-semibold text-[var(--ink)]">{item.q}</p>
            {expanded ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{item.a}</p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
