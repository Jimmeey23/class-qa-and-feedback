import { useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar } from '@project/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@project/components/ui/popover';
import { Button } from '@project/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@project/components/lib/utils';

type Props = {
  value: string; // datetime-local format: "YYYY-MM-DDThh:mm"
  onChange: (v: string) => void;
  className?: string;
};

function parseValue(value: string): { date: Date | undefined; hours: string; minutes: string } {
  if (!value) return { date: undefined, hours: '09', minutes: '00' };
  const d = new Date(value);
  if (!isValid(d)) return { date: undefined, hours: '09', minutes: '00' };
  return {
    date: d,
    hours: String(d.getHours()).padStart(2, '0'),
    minutes: String(d.getMinutes()).padStart(2, '0'),
  };
}

function toLocalDatetimeString(date: Date, hours: string, minutes: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}T${hours}:${minutes}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

function formatHour(h: string) {
  const n = parseInt(h);
  const suffix = n < 12 ? 'AM' : 'PM';
  const display = n === 0 ? 12 : n > 12 ? n - 12 : n;
  return `${display}:00 ${suffix}`;
}

export default function DateTimePicker({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const { date, hours, minutes } = parseValue(value);

  const setDate = (d: Date | undefined) => {
    if (!d) return;
    onChange(toLocalDatetimeString(d, hours, minutes));
  };

  const setTime = (h: string, m: string) => {
    if (!date) return;
    onChange(toLocalDatetimeString(date, h, m));
  };

  const displayLabel = date
    ? `${format(date, 'EEE, MMM d yyyy')} · ${formatHour(hours).replace(':00', `:${minutes}`)}`
    : 'Pick date & time…';

  // Fix the display for non-00 minutes
  const formattedTime = () => {
    const n = parseInt(hours);
    const suffix = n < 12 ? 'AM' : 'PM';
    const display = n === 0 ? 12 : n > 12 ? n - 12 : n;
    return `${display}:${minutes} ${suffix}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-11 w-full justify-start text-left font-normal bg-muted/40 border-border/70 hover:bg-muted/60',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          {date ? (
            <span className="flex items-center gap-2">
              <span>{format(date, 'EEE, MMM d, yyyy')}</span>
              <span className="text-muted-foreground">·</span>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{formattedTime()}</span>
            </span>
          ) : (
            <span>Pick date & time…</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="border-b border-border"
        />

        {/* Time picker */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            {/* Hour */}
            <Select
              value={hours}
              onValueChange={h => {
                setTime(h, minutes);
              }}
            >
              <SelectTrigger className="h-9 flex-1 min-w-0 bg-muted/30 border-border/60 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-52">
                {HOURS.map(h => (
                  <SelectItem key={h} value={h}>{formatHour(h)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-muted-foreground font-semibold text-sm">:</span>

            {/* Minutes */}
            <Select
              value={minutes}
              onValueChange={m => {
                setTime(hours, m);
              }}
            >
              <SelectTrigger className="h-9 w-20 bg-muted/30 border-border/60 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MINUTES.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            size="sm"
            className="h-9 px-4"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
