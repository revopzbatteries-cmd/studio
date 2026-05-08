"use client";

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface DynamicListInputProps {
  label: string;
  placeholder?: string;
  items: string[];
  onChange: (items: string[]) => void;
}

export function DynamicListInput({
  label,
  placeholder = 'Add item...',
  items,
  onChange,
}: DynamicListInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setInputValue('');
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>

      {/* Input row */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-background/50 border-border/60 focus:border-primary/50"
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleAdd}
          className="shrink-0 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Item chips */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                         bg-primary/10 text-primary border border-primary/20
                         animate-in fade-in-0 slide-in-from-left-2 duration-200"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-0.5 rounded-full hover:text-destructive transition-colors focus:outline-none"
                aria-label={`Remove ${item}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No items added yet.</p>
      )}
    </div>
  );
}
