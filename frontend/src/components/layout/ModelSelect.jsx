import { Check, ChevronDown } from 'lucide-react';
import { Button, Dropdown } from '@/components/ui';
import { MODELS } from '@/constants/app';

export default function ModelSelect({
  activeModel,
  onChange,
  isOpen,
  onOpenChange,
}) {
  const selected = MODELS.find((model) => model.id === activeModel) || MODELS[0];

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      width="w-72"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(!isOpen)}
          className="px-2 font-outfit text-sm font-semibold text-[var(--ink)]"
        >
          <span>{selected.name}</span>
          <ChevronDown
            className={`h-4 w-4 text-[var(--ink-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      }
    >
      {MODELS.map((model) => {
        const selectedModel = model.id === activeModel;
        return (
          <button
            key={model.id}
            type="button"
            onClick={() => {
              onChange(model.id);
              onOpenChange(false);
            }}
            className="flex w-full items-start justify-between rounded-xl p-2.5 text-left hover:bg-[var(--bg-card)]"
          >
            <span>
              <span className="block text-sm font-medium text-[var(--ink)]">
                {model.name}
              </span>
              <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
                {model.description}
              </span>
            </span>
            {selectedModel && <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-muted)]" />}
          </button>
        );
      })}
    </Dropdown>
  );
}
