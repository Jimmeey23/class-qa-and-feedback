import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@project/components/ui/dialog';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Badge } from '@project/components/ui/badge';
import { updateAssessment, GetAssessmentsOutputType } from '@/api/client';
import { CRITERIA, getBand } from '../../data/constants';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

type A = GetAssessmentsOutputType['assessments'][0];
type Props = { assessment: A | null; onClose: () => void; onSaved: () => void };

const SCORE_FIELD_MAP: Record<string, keyof A> = {
  preClass: 'scorePreClass', clientConnection: 'scoreClientConnection', uspIntegration: 'scoreUspIntegration',
  mapping: 'scoreMapping', musicalArc: 'scoreMusicalArc', coachingDelivery: 'scoreCoachingDelivery',
  motivation: 'scoreMotivation', timeManagement: 'scoreTimeManagement', postClass: 'scorePostClass',
};

export default function HubEditDialog({ assessment: a, onClose, onSaved }: Props) {
  const [strengths, setStrengths] = useState(a?.keyStrengths ?? '');
  const [improvements, setImprovements] = useState(a?.areasForImprovement ?? '');
  const [coaching, setCoaching] = useState(a?.coachingActionPlan ?? '');
  const [saving, setSaving] = useState(false);

  if (!a) return null;
  const band = getBand(a.totalScore);

  const save = async () => {
    setSaving(true);
    try {
      await updateAssessment({
        id: a.id,
        keyStrengths: strengths,
        areasForImprovement: improvements,
        coachingActionPlan: coaching,
      });
      toast.success('Feedback updated');
      onSaved();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold">Edit Assessment — {a.trainerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Context */}
          <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
            {a.sessionName} · {a.location}
          </div>

          {/* Score summary — read only */}
          <div className="rounded-xl border overflow-hidden">
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-2.5 border-b">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Scores — Locked After Submission
              </span>
            </div>
            <div className="divide-y">
              {CRITERIA.map(c => {
                const score = (a[SCORE_FIELD_MAP[c.id]] as number) ?? 0;
                const pct = (score / c.maxPts) * 100;
                const cls = pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-blue-600' : pct >= 40 ? 'text-amber-600' : 'text-rose-600';
                return (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs text-muted-foreground">{c.label}</span>
                    <span className={`text-xs font-bold ${cls}`}>{score.toFixed(1)} / {c.maxPts}</span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-3 py-2.5 bg-muted/10">
                <span className="text-sm font-bold">Total</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${band.colorClass} ${band.bgClass}`}>{band.label}</Badge>
                  <span className={`text-lg font-black ${band.colorClass}`}>{a.totalScore.toFixed(1)} / 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editable text fields */}
          <p className="text-xs text-muted-foreground px-0.5">You may update qualitative feedback below:</p>
          {[
            { label: 'Key Strengths', val: strengths, set: setStrengths },
            { label: 'Areas for Improvement', val: improvements, set: setImprovements },
            { label: 'Coaching Action Plan', val: coaching, set: setCoaching },
          ].map(({ label, val, set }) => (
            <div key={label} className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
              <Textarea value={val} onChange={e => set(e.target.value)} rows={3} className="resize-none text-sm" />
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Feedback'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
