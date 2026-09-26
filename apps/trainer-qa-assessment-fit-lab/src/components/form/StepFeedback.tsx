import { useState } from 'react';
import { Textarea } from '@project/components/ui/textarea';
import { Label } from '@project/components/ui/label';
import { FormState } from '../../types/assessment';
import { ThumbsUp, TrendingUp, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { COACHING_QUICK_OPTIONS, STRENGTHS_QUICK_OPTIONS, IMPROVEMENT_QUICK_OPTIONS, CRITERIA } from '../../data/constants';

type Props = { form: FormState; setForm: (f: FormState) => void };

const fields = [
  { key: 'strengths' as const,          label: 'Key Strengths Observed',              icon: ThumbsUp,    color: 'text-emerald-500', placeholder: 'What stood out positively? What should the trainer keep doing?',          quickOptions: STRENGTHS_QUICK_OPTIONS },
  { key: 'areasForImprovement' as const, label: 'Areas for Improvement',               icon: TrendingUp,  color: 'text-amber-500',   placeholder: 'What specific areas need development? Be constructive and specific.',     quickOptions: IMPROVEMENT_QUICK_OPTIONS },
  { key: 'coachingActionPlan' as const,  label: 'Immediate Coaching Notes / Action Plan', icon: Zap,      color: 'text-blue-500',    placeholder: 'Immediate next steps for the trainer to focus on for their next class?', quickOptions: COACHING_QUICK_OPTIONS },
];

export default function StepFeedback({ form, setForm }: Props) {
  const [openSuggestions, setOpenSuggestions] = useState<Record<string, boolean>>({});

  // Adds the suggestion as a bullet point on a new line
  const addBullet = (key: keyof typeof form, text: string) => {
    const current = (form[key] as string).trim();
    const bullet = `• ${text}`;
    setForm({ ...form, [key]: current ? `${current}\n${bullet}` : bullet });
  };

  const toggleSuggestions = (key: string) =>
    setOpenSuggestions(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-5">
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border">
        <span className="font-semibold">Section {CRITERIA.length + 2} of {CRITERIA.length + 3}</span> — Qualitative Feedback <span className="text-muted-foreground/60">(optional)</span>
      </div>

      {fields.map(({ key, label, icon: Icon, placeholder, color, quickOptions }) => {
        const isOpen = openSuggestions[key] ?? false;
        return (
          <div key={key} className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Icon className={`h-4 w-4 ${color}`} />{label}
            </Label>

            {/* Suggestions — collapsed by default, subtle styling */}
            <div className="rounded-lg border border-border/40 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSuggestions(key)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-[11px] text-muted-foreground/70 hover:bg-muted/20 transition-colors"
              >
                <span>Quick suggestions</span>
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {isOpen && (
                <div className="border-t border-border/30 px-3 py-2.5 flex flex-wrap gap-1.5 bg-muted/10 animate-in slide-in-from-top-1 duration-150">
                  {quickOptions.map(opt => (
                    <button
                      key={opt} type="button"
                      onClick={() => addBullet(key, opt)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-border/40 text-muted-foreground/70 hover:bg-accent hover:text-accent-foreground hover:border-primary/30 transition-colors"
                    >
                      {opt.length > 42 ? opt.slice(0, 42) + '…' : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Taller textarea */}
            <Textarea
              placeholder={placeholder}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              rows={5}
              className="resize-none text-sm leading-relaxed"
            />
          </div>
        );
      })}
    </div>
  );
}
