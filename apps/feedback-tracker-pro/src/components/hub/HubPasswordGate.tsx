import { useState } from 'react';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { ADMIN_CODE } from '../../data/constants';

type Props = { onUnlock: () => void };

export default function HubPasswordGate({ onUnlock }: Props) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const attempt = () => {
    if (pw === ADMIN_CODE) { onUnlock(); }
    else {
      setError(true); setShaking(true); setPw('');
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className={`w-full max-w-sm space-y-6 transition-all ${shaking ? 'animate-bounce' : ''}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black">Assessment Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter the admin access code to continue</p>
        </div>

        <div className="bg-background rounded-2xl border shadow-xl p-6 space-y-4">
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              placeholder="Enter access code…"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              className={`pr-10 text-center text-lg tracking-widest h-12 ${error ? 'border-destructive ring-destructive' : ''}`}
              autoFocus
            />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-destructive text-center font-medium">Incorrect access code. Please try again.</p>}
          <Button className="w-full h-11 text-base font-semibold" onClick={attempt}>Unlock Hub</Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">PHYSIQUE 57 · Internal Tool</p>
      </div>
    </div>
  );
}
