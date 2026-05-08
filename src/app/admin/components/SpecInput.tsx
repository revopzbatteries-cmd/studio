"use client";

import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface Spec {
  key: string;
  value: string;
}

interface SpecInputProps {
  specs: Spec[];
  onChange: (specs: Spec[]) => void;
}

export function SpecInput({ specs, onChange }: SpecInputProps) {
  const handleAdd = () => {
    onChange([...specs, { key: '', value: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(specs.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = specs.map((spec, i) =>
      i === index ? { ...spec, [field]: val } : spec
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-foreground">
        Specifications
        <span className="ml-2 text-xs font-normal text-muted-foreground">(key–value pairs)</span>
      </Label>

      <div className="space-y-2">
        {specs.map((spec, index) => (
          <div
            key={index}
            className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200"
          >
            <Input
              value={spec.key}
              onChange={(e) => handleChange(index, 'key', e.target.value)}
              placeholder="e.g. Input Voltage"
              className="flex-1 bg-background/50 border-border/60 focus:border-primary/50 text-sm"
            />
            <span className="text-muted-foreground shrink-0 text-sm font-mono">:</span>
            <Input
              value={spec.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              placeholder="e.g. 180V–260V"
              className="flex-1 bg-background/50 border-border/60 focus:border-primary/50 text-sm"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => handleRemove(index)}
              className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              aria-label="Remove specification"
            >
              <X size={15} />
            </Button>
          </div>
        ))}
      </div>

      {specs.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No specifications added yet.</p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-muted-foreground transition-all"
      >
        <Plus size={14} className="mr-2" />
        Add Specification Row
      </Button>
    </div>
  );
}
