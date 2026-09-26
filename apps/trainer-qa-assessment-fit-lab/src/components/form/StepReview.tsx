import { Badge } from '@project/components/ui/badge';
import { CRITERIA, getBand, getInitials, getAvatarColor } from '../../data/constants';
import { pctColor } from '../ScoreInput';
import { FormState } from '../../types/assessment';
import { format } from 'date-fns';

type Props = { form: FormState };

export default function StepReview({ form }: Props) {
  const total = CRITERIA.reduce((sum, c) => sum + (form.scores[c.id] ?? 0), 0);
  const band = getBand(total);

  return (
    <div className="space-y-5">
      <div className={`rounded-xl border-2 p-4 flex items-center justify-between ${band.bgClass}`}>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total Score</div>
          <div className={`text-4xl font-black ${band.colorClass}`}>{total.toFixed(1)}<span className="text-base font-normal text-muted-foreground"> / 100</span></div>
        </div>
        <Badge className="text-sm px-4 py-1.5 font-bold">{band.label}</Badge>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarColor(form.trainerName)}`}>
            {getInitials(form.trainerName)}
          </div>
          <div>
            <div className="font-semibold">{form.trainerName || '—'}</div>
            <div className="text-xs text-muted-foreground">{form.sessionName || '—'} · {form.location || '—'}</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {form.classDate ? format(new Date(form.classDate), 'dd MMMM yyyy, hh:mm a') : '—'} · Evaluated by {form.evaluatorName || '—'}
        </div>
      </div>

      <div className="space-y-1.5">
        {CRITERIA.map(c => {
          const score = form.scores[c.id] ?? 0;
          const pct = (score / c.maxPts) * 100;
          const col = pctColor(pct);
          return (
            <div key={c.id} className="flex items-center gap-3 text-sm">
              <div className="flex-1 truncate text-muted-foreground">{c.label}</div>
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-colors duration-200 ${col.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <div className={`w-16 text-right font-semibold tabular-nums transition-colors duration-200 ${col.text}`}>{score} / {c.maxPts}</div>
            </div>
          );
        })}
      </div>

      {form.strengths && <div className="text-xs bg-emerald-50 border border-emerald-100 rounded-lg p-3"><span className="font-semibold text-emerald-700">Strengths: </span><span className="text-emerald-800">{form.strengths}</span></div>}
      {form.areasForImprovement && <div className="text-xs bg-amber-50 border border-amber-100 rounded-lg p-3"><span className="font-semibold text-amber-700">Improvement: </span><span className="text-amber-800">{form.areasForImprovement}</span></div>}
    </div>
  );
}
