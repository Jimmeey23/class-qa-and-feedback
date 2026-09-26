import { useState } from 'react';
import ScoreInput from '../ScoreInput';
import SectionMedia from '../SectionMedia';
import { SectionData } from '../../types/assessment';
import { CheckCircle2, ChevronDown, ChevronUp, Keyboard } from 'lucide-react';

type Criterion = {
  id: string; label: string; maxPts: number;
  description: string; subPoints: readonly string[]; quickNotes: readonly string[];
};

type Props = {
  criterion: Criterion; stepNumber: number; totalCriteria: number;
  score: number; section: SectionData;
  onScoreChange: (v: number) => void; onSectionChange: (s: SectionData) => void;
};

export default function StepCriterion({ criterion, stepNumber, totalCriteria, score, section, onScoreChange, onSectionChange }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const appendNote = (note: string) => {
    const current = section.notes.trim();
    onSectionChange({ ...section, notes: current ? `${current}. ${note}` : note });
  };

  return (
    <div className="space-y-3">
      {/* Collapsible criterion info */}
      <button
        type="button"
        onClick={() => setShowInfo(s => !s)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors text-left group"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
            {criterion.description}
          </p>
        </div>
        {showInfo
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
      </button>

      {showInfo && (
        <ul className="space-y-1 px-1 animate-in slide-in-from-top-1 duration-150">
          {criterion.subPoints.map((pt, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />{pt}
            </li>
          ))}
        </ul>
      )}

      {/* Score input — always fully visible */}
      <ScoreInput value={score} max={criterion.maxPts} onChange={onScoreChange} />

      {/* Keyboard hint + required warning */}
      <div className="flex items-center justify-center gap-2">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <Keyboard className="h-3 w-3" />↑↓ keys adjust score · →/Enter to continue
        </span>
      </div>
      {score === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center font-medium">
          ⚠️ A score is required to continue
        </p>
      )}

      {/* Notes — collapsible */}
      <div className="border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowNotes(s => !s)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Notes & Attachments <span className="font-normal normal-case text-muted-foreground/50">(optional)</span>
          </span>
          {showNotes ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
        {showNotes && (
          <div className="p-4 space-y-3 animate-in slide-in-from-top-1 duration-150">
            <div className="flex flex-wrap gap-1.5">
              {criterion.quickNotes.map(note => (
                <button
                  key={note} type="button" onClick={() => appendNote(note)}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground/70 hover:bg-accent hover:text-accent-foreground hover:border-border transition-colors"
                >
                  {note.length > 38 ? note.slice(0, 38) + '…' : note}
                </button>
              ))}
            </div>
            <SectionMedia data={section} onChange={onSectionChange} />
          </div>
        )}
      </div>
    </div>
  );
}
