import { useState } from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  FlaskConical, 
  Users, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import { Button, Badge, Dropdown } from '@/components/ui';
import { PERSONAS } from '@/constants/app';

const ICON_MAP = {
  Sparkles,
  GraduationCap,
  FlaskConical,
  Users,
};

export default function PersonaSelect({
  activePersona = 'socratic-mentor',
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = PERSONAS.find((p) => p.id === activePersona) || PERSONAS[0];
  const SelectedIcon = ICON_MAP[selected.icon] || Sparkles;

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      width="w-80"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`Select Tutor Persona mode. Currently selected: ${selected.name}`}
          className="px-2.5 py-1.5 font-outfit text-xs sm:text-sm font-semibold text-[var(--ink)] flex items-center space-x-1.5 max-w-[200px] sm:max-w-xs"
        >
          <SelectedIcon className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
          <span className="truncate">{selected.name}</span>
          <Badge variant={selected.badgeVariant} size="sm" className="hidden xs:inline-flex">
            Persona
          </Badge>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </Button>
      }
    >
      <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
          Tutor Persona Mode
        </p>
      </div>
      <div className="space-y-1" role="menu">
        {PERSONAS.map((persona) => {
          const Icon = ICON_MAP[persona.icon] || Sparkles;
          const isSelected = persona.id === activePersona;

          return (
            <button
              key={persona.id}
              type="button"
              role="menuitemradio"
              aria-checked={isSelected}
              onClick={() => {
                onChange(persona.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-start space-x-3 p-2.5 rounded-xl transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isSelected
                  ? 'bg-[var(--bg-card)] text-[var(--ink)]'
                  : 'hover:bg-[var(--bg-card)] text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              <div
                className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--ink)]">{persona.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />}
                </div>
                <p className="text-[11px] text-[var(--ink-muted)] mt-0.5 leading-snug line-clamp-2">
                  {persona.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Dropdown>
  );
}
