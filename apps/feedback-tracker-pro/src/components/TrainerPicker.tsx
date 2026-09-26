import { Check } from 'lucide-react';
import { getInitials, getAvatarColor } from '../data/constants';
import { TrainerOption } from '../pages/FormPage';

type Props = { trainers: TrainerOption[]; selected: string; onSelect: (name: string) => void };

function TrainerCard({ trainer, selected, onSelect }: { trainer: TrainerOption; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150 text-center group
        ${selected
          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]'
          : 'border-border hover:border-primary/40 hover:bg-muted/30 hover:scale-[1.01]'
        }`}
    >
      <div className="relative flex-shrink-0">
        {trainer.photoUrl ? (
          <img
            src={trainer.photoUrl}
            alt={trainer.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-background shadow-sm"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${getAvatarColor(trainer.name)}`}>
            {getInitials(trainer.name)}
          </div>
        )}
        {selected && (
          <div className="absolute -top-1 -right-1 bg-primary rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-background shadow-sm">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <span className="text-xs font-medium leading-tight break-words w-full">{trainer.name.split(' ')[0]}<br /><span className="text-muted-foreground text-[10px]">{trainer.name.split(' ').slice(1).join(' ')}</span></span>
    </button>
  );
}

export default function TrainerPicker({ trainers, selected, onSelect }: Props) {
  if (trainers.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
        No trainers found for this location. Add trainers via Admin Config.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {trainers.map(t => (
        <TrainerCard key={t.id} trainer={t} selected={selected === t.name} onSelect={() => onSelect(t.name)} />
      ))}
    </div>
  );
}
