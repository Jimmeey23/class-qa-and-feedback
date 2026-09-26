import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer, GetTrainersOutputType } from '@/api/client';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Badge } from '@project/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@project/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@project/components/ui/alert-dialog';
import { Skeleton } from '@project/components/ui/skeleton';
import { Switch } from '@project/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { ArrowLeft, Plus, Pencil, Trash2, User, Lock, Eye, EyeOff, UserCheck, Settings, Shield, Info } from 'lucide-react';
import { getInitials, getAvatarColor, ADMIN_CODE, PERFORMANCE_BANDS, LOCATIONS, SESSION_NAMES } from '../data/constants';
import { toast } from 'sonner';

type Trainer = GetTrainersOutputType['trainers'][0];

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (pw === ADMIN_CODE) { onUnlock(); }
    else { setError(true); setShake(true); setPw(''); setTimeout(() => setShake(false), 500); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-sm space-y-6 ${shake ? 'animate-bounce' : ''}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black">Admin Config</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter admin code to manage configuration</p>
        </div>
        <div className="bg-background rounded-2xl border shadow-xl p-6 space-y-4">
          <div className="relative">
            <Input type={show ? 'text' : 'password'} placeholder="Enter access code…" value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              className={`pr-10 text-center text-lg tracking-widest h-12 ${error ? 'border-destructive' : ''}`}
              autoFocus />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-destructive text-center font-medium">Incorrect code. Please try again.</p>}
          <Button className="w-full h-11 font-semibold" onClick={attempt}>Unlock Config</Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">PHYSIQUE 57 · Admin Only</p>
      </motion.div>
    </div>
  );
}

type TrainerForm = { name: string; studioGroup: 'Kenkere' | 'Other'; photoUrl: string; active: boolean };
const emptyForm = (): TrainerForm => ({ name: '', studioGroup: 'Other', photoUrl: '', active: true });

function TrainerDialog({ trainer, onClose, onSaved }: { trainer: Trainer | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!trainer;
  const [form, setForm] = useState<TrainerForm>(trainer ? {
    name: trainer.name, studioGroup: (trainer.studioGroup as 'Kenkere' | 'Other') || 'Other',
    photoUrl: trainer.photoUrl ?? '', active: trainer.active,
  } : emptyForm());
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<TrainerForm>) => setForm(f => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (isEdit && trainer) {
        await updateTrainer({ id: trainer.id, name: form.name, studioGroup: form.studioGroup, photoUrl: form.photoUrl || undefined, active: form.active });
        toast.success('Trainer updated');
      } else {
        await createTrainer({ name: form.name, studioGroup: form.studioGroup, photoUrl: form.photoUrl || undefined, active: form.active });
        toast.success('Trainer added');
      }
      onSaved();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-bold">{isEdit ? 'Edit Trainer' : 'Add New Trainer'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="preview" className="w-12 h-12 rounded-full object-cover border-2 border-border" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarColor(form.name || 'TT')}`}>
                {form.name ? getInitials(form.name) : <User className="h-5 w-5" />}
              </div>
            )}
            <div>
              <div className="font-semibold text-sm">{form.name || 'Trainer Name'}</div>
              <div className="text-xs text-muted-foreground">{form.studioGroup} Group · {form.active ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Full Name *</Label>
            <Input value={form.name} onChange={e => set({ name: e.target.value })} placeholder="e.g. Anisha Shah" className="bg-muted/30" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Studio Group *</Label>
            <Select value={form.studioGroup} onValueChange={v => set({ studioGroup: v as 'Kenkere' | 'Other' })}>
              <SelectTrigger className="bg-muted/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Kenkere">Kenkere (Kenkere House / Copper+Cloves / Pop-up)</SelectItem>
                <SelectItem value="Other">Other (All remaining studios)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Photo URL <span className="font-normal text-muted-foreground/60">(optional)</span></Label>
            <Input value={form.photoUrl} onChange={e => set({ photoUrl: e.target.value })} placeholder="https://…" className="bg-muted/30" />
            <p className="text-[10px] text-muted-foreground">Paste a direct image URL — appears as thumbnail in forms, hub & PDF reports</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border">
            <div>
              <Label className="text-sm font-semibold">Active Trainer</Label>
              <p className="text-[10px] text-muted-foreground">Inactive trainers won't appear in the assessment form</p>
            </div>
            <Switch checked={form.active} onCheckedChange={v => set({ active: v })} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Trainer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ConfigPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('configAuth') === 'ok');
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Trainer | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem('p57_logo_url') ?? '');
  const navigate = useNavigate();

  const unlock = () => { setAuthed(true); sessionStorage.setItem('configAuth', 'ok'); };
  const load = () => {
    setLoading(true);
    getTrainers({}).then(({ trainers: t }) => { setTrainers(t); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { if (authed) load(); }, [authed]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteTrainer({ id: deleteId }); toast.success('Trainer removed'); setTrainers(t => t.filter(x => x.id !== deleteId)); }
    catch { toast.error('Delete failed'); }
    finally { setDeleteId(null); }
  };

  const saveLogo = () => { localStorage.setItem('p57_logo_url', logoUrl); toast.success('Logo URL saved'); };

  const filtered = trainers.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  if (!authed) return <PasswordGate onUnlock={unlock} />;

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="bg-background border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Physique 57</div>
              <h1 className="text-lg font-black leading-tight">Admin Config</h1>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2 shadow-sm"><Plus className="h-4 w-4" />Add Trainer</Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="trainers">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex mb-6">
            <TabsTrigger value="trainers" className="gap-1.5"><UserCheck className="h-3.5 w-3.5" />Trainers</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5"><Settings className="h-3.5 w-3.5" />App Settings</TabsTrigger>
            <TabsTrigger value="reference" className="gap-1.5"><Info className="h-3.5 w-3.5" />Reference</TabsTrigger>
          </TabsList>

          {/* Trainers Tab */}
          <TabsContent value="trainers" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: UserCheck, label: 'Total Trainers', value: String(trainers.length), color: 'text-primary bg-primary/10' },
                { icon: User, label: 'Kenkere Group', value: String(trainers.filter(t => t.studioGroup === 'Kenkere').length), color: 'text-violet-600 bg-violet-50' },
                { icon: User, label: 'Other Group', value: String(trainers.filter(t => t.studioGroup === 'Other').length), color: 'text-blue-600 bg-blue-50' },
              ].map(({ icon: Icon, label, value, color }) => (
                <Card key={label} className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon className="h-4 w-4" /></div>
                    <div><div className="text-xl font-black">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="text-base font-bold">Trainer Roster</CardTitle>
                  <Input className="max-w-xs h-9 bg-muted/30" placeholder="Search trainers…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
                ) : filtered.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No trainers found.</p>
                    <Button variant="link" className="mt-1" onClick={() => setAddOpen(true)}>Add the first trainer</Button>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {filtered.map((t, i) => (
                      <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors group">
                        {t.photoUrl ? (
                          <img src={t.photoUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-border" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${getAvatarColor(t.name)}`}>{getInitials(t.name)}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.studioGroup} Group</div>
                        </div>
                        <Badge variant="outline" className={t.active ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-muted-foreground'}>
                          {t.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditTarget(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2"><Settings className="h-4 w-4" />App Settings</CardTitle>
              </CardHeader>
              <CardContent className="py-5 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Organisation Logo URL</Label>
                  <div className="flex gap-2">
                    <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://…/logo.png" className="bg-muted/30 flex-1" />
                    <Button onClick={saveLogo} variant="outline">Save</Button>
                  </div>
                  {logoUrl && (
                    <div className="flex items-center gap-3 mt-2 p-3 bg-muted/20 rounded-xl border">
                      <img src={logoUrl} alt="Logo preview" className="h-10 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-xs text-muted-foreground">Logo preview</span>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">Saved locally. Used in the app header and PDF reports.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Admin Access Code</Label>
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border">
                    <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Code: {ADMIN_CODE}</p>
                      <p className="text-[10px] text-muted-foreground">Controls access to Hub and this Config page. To change it, contact your developer.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Score Locking Policy</Label>
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <Lock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Scores are permanently locked after submission</p>
                      <p className="text-[10px] text-emerald-600/80">Only qualitative feedback (strengths, improvements, action plan) can be edited. Scores cannot be modified by anyone, including admins.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reference Tab */}
          <TabsContent value="reference" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold">Performance Bands</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-2">
                  {PERFORMANCE_BANDS.map(b => (
                    <div key={b.label} className={`flex items-center gap-3 p-3 rounded-xl border ${b.bgClass}`}>
                      <div className={`text-sm font-black w-32 ${b.colorClass}`}>{b.label}</div>
                      <div className={`text-xs ${b.colorClass}`}>{b.range}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b"><CardTitle className="text-base font-bold">Studios / Locations</CardTitle></CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LOCATIONS.map(l => (
                    <div key={l} className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg border text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />{l}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b"><CardTitle className="text-base font-bold">Session Types</CardTitle></CardHeader>
              <CardContent className="py-4">
                <div className="space-y-2">
                  {SESSION_NAMES.map(s => (
                    <div key={s} className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg border text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />{s}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground text-center pb-4">
              To modify locations or session types, contact your developer.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {(addOpen || editTarget) && (
        <TrainerDialog trainer={editTarget} onClose={() => { setAddOpen(false); setEditTarget(null); }} onSaved={() => { setAddOpen(false); setEditTarget(null); load(); }} />
      )}
      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove Trainer?</AlertDialogTitle><AlertDialogDescription>This trainer will be removed from the roster and will no longer appear in assessments.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
