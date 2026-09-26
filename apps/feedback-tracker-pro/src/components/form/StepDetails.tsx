import { Label } from '@project/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import TrainerPicker from '../TrainerPicker';
import { LOCATIONS, EVALUATORS, SESSION_NAMES } from '../../data/constants';
import { FormState } from '../../types/assessment';
import { TrainerOption } from '../../pages/FormPage';
import { MapPin, User, CalendarClock, ClipboardList, UserCheck } from 'lucide-react';

type Props = { form: FormState; setForm: (f: FormState) => void; trainers: TrainerOption[] };

const inputClass = 'h-11 bg-muted/40 border-border/70 focus:bg-background transition-colors';

function FieldGroup({ icon: Icon, label, required, children, hint }: {
  icon: any; label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground pl-0.5">{hint}</p>}
    </div>
  );
}

export default function StepDetails({ form, setForm, trainers }: Props) {
  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch });

  return (
    <div className="space-y-6">
      {/* Row 1: Session + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldGroup icon={ClipboardList} label="Class / Session Type" required>
          <Select value={form.sessionName} onValueChange={v => set({ sessionName: v })}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Select class type…" />
            </SelectTrigger>
            <SelectContent>
              {SESSION_NAMES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldGroup>

        <FieldGroup icon={CalendarClock} label="Date & Time of Class" required>
          <input
            type="datetime-local"
            value={form.classDate}
            onChange={e => set({ classDate: e.target.value })}
            className="flex h-11 w-full rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm ring-offset-background focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
          />
        </FieldGroup>
      </div>

      {/* Studio */}
      <FieldGroup icon={MapPin} label="Studio / Center" required hint="Trainer list updates based on selected studio">
        <Select value={form.location} onValueChange={v => set({ location: v, trainerName: '' })}>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Select a studio or location…" />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </FieldGroup>

      {/* Trainer — only shown when location is selected */}
      {form.location && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Select Instructor<span className="text-destructive ml-0.5">*</span>
          </Label>
          <TrainerPicker
            trainers={trainers}
            selected={form.trainerName}
            onSelect={t => set({ trainerName: t })}
          />
        </div>
      )}

      {/* Evaluator */}
      <FieldGroup icon={UserCheck} label="Evaluated By" required>
        <Select value={form.evaluatorName} onValueChange={v => set({ evaluatorName: v })}>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Select evaluator…" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {EVALUATORS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </FieldGroup>
    </div>
  );
}
