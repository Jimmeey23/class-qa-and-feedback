import { Minus, Plus } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Slider } from '@project/components/ui/slider';

type Props = { value: number; max: number; onChange: (v: number) => void };

export function pctColor(pct: number) {
  if (pct >= 80) return { text: 'text-emerald-500', bar: 'bg-emerald-500', hsl: '160 84% 39%' };
  if (pct >= 60) return { text: 'text-blue-500',    bar: 'bg-blue-500',    hsl: '217 91% 60%' };
  if (pct >= 40) return { text: 'text-amber-500',   bar: 'bg-amber-500',   hsl: '38 92% 50%'  };
  return             { text: 'text-rose-500',    bar: 'bg-rose-500',    hsl: '347 77% 53%' };
}

export default function ScoreInput({ value, max, onChange }: Props) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const c = pctColor(pct);
  const adj = (d: number) => onChange(Math.round(Math.max(0, Math.min(max, value + d)) * 2) / 2);

  return (
    <div className="space-y-4 py-2">
      {/* Score + ± buttons in one compact row */}
      <div className="flex items-center gap-4 justify-center">
        <Button
          type="button" variant="outline" size="icon"
          className="h-14 w-14 rounded-full flex-shrink-0 text-lg shadow-sm"
          onClick={() => adj(-0.5)}
        >
          <Minus className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center min-w-[110px]">
          <div className={`text-[5.5rem] font-black tabular-nums leading-none transition-colors duration-200 ${c.text}`}>
            {value % 1 === 0 ? value : value.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            out of <span className="font-bold text-foreground">{max}</span> pts
          </div>
        </div>

        <Button
          type="button" variant="outline" size="icon"
          className="h-14 w-14 rounded-full flex-shrink-0 text-lg shadow-sm"
          onClick={() => adj(0.5)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Slider — color follows score via CSS var override */}
      <div
        className="px-2 transition-all duration-300"
        style={{ '--primary': c.hsl } as React.CSSProperties}
      >
        <Slider value={[value]} min={0} max={max} step={0.5} onValueChange={([v]) => onChange(v)} />
      </div>

      {/* Quick presets */}
      <div className="flex justify-center gap-2 flex-wrap">
        {[0, 25, 50, 75, 100].map(p => {
          const v = Math.round((p / 100) * max * 2) / 2;
          const isActive = Math.abs(pct - p) < 3;
          const markerColor = pctColor(p);
          return (
            <button
              key={p} type="button" onClick={() => onChange(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200
                ${isActive
                  ? `${markerColor.bar} ${markerColor.bar.replace('bg-', 'border-')} text-white`
                  : `bg-background border-border hover:bg-muted ${markerColor.text}`
                }`}
            >
              {p === 0 ? '0' : p === 100 ? 'Full' : `${p}%`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
