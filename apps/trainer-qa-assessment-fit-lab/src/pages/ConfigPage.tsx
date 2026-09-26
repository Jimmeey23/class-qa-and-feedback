import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer, getSettings, saveSettings, GetTrainersOutputType } from '@/api/client';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@project/components/ui/card';
import { Badge } from '@project/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@project/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@project/components/ui/alert-dialog';
import { Skeleton } from '@project/components/ui/skeleton';
import { Switch } from '@project/components/ui/switch';
import { Checkbox } from '@project/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { Textarea } from '@project/components/ui/textarea';
import { ArrowLeft, Plus, Pencil, Trash2, User, Lock, Eye, EyeOff, UserCheck, Settings, Palette, MapPin, ClipboardList, Info, Shield, Upload, CheckSquare, Square, ToggleLeft } from 'lucide-react';
import { getInitials, getAvatarColor, ADMIN_CODE, PERFORMANCE_BANDS } from '../data/constants';
import { applyThemeColor } from '../App';
import { toast } from 'sonner';

type Trainer = GetTrainersOutputType['trainers'][0];

// ─── Password Gate ───────────────────────────────────────────────────────────
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-sm space-y-6 ${shake ? 'animate-bounce' : ''}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4"><Lock className="h-8 w-8 text-primary" /></div>
          <h1 className="text-2xl font-black">Admin Config</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your admin code to manage configuration</p>
        </div>
        <div className="bg-background rounded-2xl border shadow-xl p-6 space-y-4">
          <div className="relative">
            <Input type={show ? 'text' : 'password'} placeholder="Enter access code…" value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              className={`pr-10 text-center text-lg tracking-widest h-12 ${error ? 'border-destructive' : ''}`} autoFocus />
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

// ─── Trainer Dialog ──────────────────────────────────────────────────────────
type TrainerForm = { name: string; studioGroup: 'Kenkere' | 'Other'; photoUrl: string; active: boolean };
const emptyForm = (): TrainerForm => ({ name: '', studioGroup: 'Other', photoUrl: '', active: true });

function TrainerDialog({ trainer, onClose, onSaved }: { trainer: Trainer | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!trainer;
  const [form, setForm] = useState<TrainerForm>(trainer ? { name: trainer.name, studioGroup: (trainer.studioGroup as 'Kenkere' | 'Other') || 'Other', photoUrl: trainer.photoUrl ?? '', active: trainer.active } : emptyForm());
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
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
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
                <SelectItem value="Kenkere">Kenkere Group</SelectItem>
                <SelectItem value="Other">Other (All remaining studios)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Photo URL <span className="font-normal text-muted-foreground/60">(optional)</span></Label>
            <Input value={form.photoUrl} onChange={e => set({ photoUrl: e.target.value })} placeholder="https://…" className="bg-muted/30" />
            <p className="text-[10px] text-muted-foreground">Paste a direct image URL — shown in forms, hub & reports</p>
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

// ─── Bulk Import Dialog ──────────────────────────────────────────────────────
function BulkImportDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [text, setText] = useState('');
  const [group, setGroup] = useState<'Kenkere' | 'Other'>('Other');
  const [importing, setImporting] = useState(false);

  const names = useMemo(() => text.split('\n').map(n => n.trim()).filter(Boolean), [text]);

  const handleImport = async () => {
    if (!names.length) return;
    setImporting(true);
    let created = 0;
    for (const name of names) {
      try { await createTrainer({ name, studioGroup: group, active: true }); created++; } catch {}
    }
    toast.success(`${created} trainer${created !== 1 ? 's' : ''} imported`);
    onDone();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-bold flex items-center gap-2"><Upload className="h-4 w-4" />Bulk Import Trainers</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Paste Names (one per line)</Label>
            <Textarea value={text} onChange={e => setText(e.target.value)} placeholder={"Anisha Shah\nAtulan Purohit\nVivaran Dhasmana"} rows={8} className="bg-muted/30 font-mono text-sm" />
            <p className="text-[10px] text-muted-foreground">{names.length} trainer{names.length !== 1 ? 's' : ''} detected</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Studio Group</Label>
            <Select value={group} onValueChange={v => setGroup(v as 'Kenkere' | 'Other')}>
              <SelectTrigger className="bg-muted/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Kenkere">Kenkere Group</SelectItem>
                <SelectItem value="Other">Other Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={!names.length || importing}>
            {importing ? 'Importing…' : `Import ${names.length} Trainer${names.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Color helpers ───────────────────────────────────────────────────────────
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslToHex(hsl: string): string {
  const parts = hsl.split(' ');
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const X = C * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - C / 2;
  let r = 0, g = 0, b = 0;
  if (h < 1 / 6) { r = C; g = X; }
  else if (h < 2 / 6) { r = X; g = C; }
  else if (h < 3 / 6) { g = C; b = X; }
  else if (h < 4 / 6) { g = X; b = C; }
  else if (h < 5 / 6) { r = X; b = C; }
  else { r = C; b = X; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ─── Main Config Page ─────────────────────────────────────────────────────────
export default function ConfigPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('configAuth') === 'ok');
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Trainer | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Locations & sessions
  const [locations, setLocations] = useState<string[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [newSession, setNewSession] = useState('');
  // Appearance
  const [primaryHex, setPrimaryHex] = useState('#8B0000');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const unlock = () => { setAuthed(true); sessionStorage.setItem('configAuth', 'ok'); };

  const loadAll = () => {
    setLoading(true);
    getTrainers({}).then(({ trainers: t }) => { setTrainers(t); setLoading(false); }).catch(() => setLoading(false));
    getSettings({}).then(s => {
      setLocations(s.locations);
      setSessions(s.sessionTypes);
      setLogoUrl(s.logoUrl);
      if (s.primaryColor) {
        try { setPrimaryHex(hslToHex(s.primaryColor)); } catch {}
      }
    }).catch(() => {});
  };

  useEffect(() => { if (authed) loadAll(); }, [authed]);

  const filtered = useMemo(() => trainers.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase())), [trainers, search]);
  const allSelected = filtered.length > 0 && filtered.every(t => selectedIds.has(t.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id: string) => setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(filtered.map(t => t.id)));

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteTrainer({ id: deleteId }); toast.success('Trainer removed'); setTrainers(t => t.filter(x => x.id !== deleteId)); }
    catch { toast.error('Delete failed'); } finally { setDeleteId(null); }
  };

  const handleBulkActivate = async (active: boolean) => {
    const ids = [...selectedIds];
    for (const id of ids) { try { await updateTrainer({ id, name: trainers.find(t => t.id === id)?.name ?? '', studioGroup: 'Other', active }); } catch {} }
    toast.success(`${ids.length} trainer${ids.length !== 1 ? 's' : ''} ${active ? 'activated' : 'deactivated'}`);
    setSelectedIds(new Set()); loadAll();
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    for (const id of ids) { try { await deleteTrainer({ id }); } catch {} }
    toast.success(`${ids.length} trainer${ids.length !== 1 ? 's' : ''} deleted`);
    setSelectedIds(new Set()); loadAll(); setBulkDeleteConfirm(false);
  };

  const saveLocations = async (newList: string[]) => {
    setLocations(newList);
    await saveSettings({ key: 'locations', value: JSON.stringify(newList) });
    toast.success('Locations saved');
  };

  const saveSessions = async (newList: string[]) => {
    setSessions(newList);
    await saveSettings({ key: 'sessionTypes', value: JSON.stringify(newList) });
    toast.success('Session types saved');
  };

  const saveAppearance = async () => {
    setSaving(true);
    try {
      const hsl = hexToHsl(primaryHex);
      await Promise.all([
        saveSettings({ key: 'primaryColor', value: hsl }),
        saveSettings({ key: 'logoUrl', value: logoUrl }),
      ]);
      applyThemeColor(hsl);
      toast.success('Appearance saved and applied!');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  if (!authed) return <PasswordGate onUnlock={unlock} />;

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="bg-background border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="trainers">
          <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex mb-6 h-10">
            <TabsTrigger value="trainers" className="gap-1.5 text-xs sm:text-sm"><UserCheck className="h-3.5 w-3.5 hidden sm:block" />Trainers</TabsTrigger>
            <TabsTrigger value="studios" className="gap-1.5 text-xs sm:text-sm"><MapPin className="h-3.5 w-3.5 hidden sm:block" />Studios</TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1.5 text-xs sm:text-sm"><ClipboardList className="h-3.5 w-3.5 hidden sm:block" />Sessions</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5 text-xs sm:text-sm"><Palette className="h-3.5 w-3.5 hidden sm:block" />Appearance</TabsTrigger>
          </TabsList>

          {/* ── Trainers Tab ── */}
          <TabsContent value="trainers" className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total', value: trainers.length, color: 'text-primary bg-primary/10' },
                { label: 'Active', value: trainers.filter(t => t.active).length, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Inactive', value: trainers.filter(t => !t.active).length, color: 'text-muted-foreground bg-muted/30' },
                { label: 'Kenkere', value: trainers.filter(t => t.studioGroup === 'Kenkere').length, color: 'text-violet-600 bg-violet-50' },
              ].map(({ label, value, color }) => (
                <Card key={label} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className={`text-2xl font-black ${color.split(' ')[0]}`}>{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label} Trainers</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bulk controls + search */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold">Trainer Roster</CardTitle>
                    {someSelected && <Badge variant="outline" className="text-xs">{selectedIds.size} selected</Badge>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {someSelected && (
                      <>
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-emerald-600 border-emerald-200" onClick={() => handleBulkActivate(true)}><ToggleLeft className="h-3.5 w-3.5" />Activate</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-amber-600 border-amber-200" onClick={() => handleBulkActivate(false)}><ToggleLeft className="h-3.5 w-3.5" />Deactivate</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-destructive border-destructive/30" onClick={() => setBulkDeleteConfirm(true)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setImportOpen(true)}><Upload className="h-3.5 w-3.5" />Bulk Import</Button>
                    <Input className="w-48 h-8 bg-muted/30 text-sm" placeholder="Search trainers…" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Header row with select-all */}
                {!loading && filtered.length > 0 && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-muted/20 border-b text-xs font-semibold text-muted-foreground">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="h-4 w-4" />
                    <span className="flex-1">Name</span>
                    <span className="w-20 text-center hidden sm:block">Group</span>
                    <span className="w-16 text-center">Status</span>
                    <span className="w-16"></span>
                  </div>
                )}

                {loading ? (
                  <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
                ) : filtered.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No trainers found.</p>
                    <Button variant="link" className="mt-1" onClick={() => setAddOpen(true)}>Add the first trainer</Button>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {filtered.map((t, i) => (
                      <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.02 }}
                        className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors group ${selectedIds.has(t.id) ? 'bg-primary/5' : ''}`}>
                        <Checkbox checked={selectedIds.has(t.id)} onCheckedChange={() => toggleSelect(t.id)} className="h-4 w-4 flex-shrink-0" />
                        {t.photoUrl ? (
                          <img src={t.photoUrl} alt={t.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-border" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${getAvatarColor(t.name)}`}>{getInitials(t.name)}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{t.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">{t.studioGroup} Group</div>
                        </div>
                        <span className="text-xs text-muted-foreground w-20 text-center hidden sm:block">{t.studioGroup}</span>
                        <Badge variant="outline" className={`w-16 justify-center text-[10px] ${t.active ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-muted-foreground'}`}>
                          {t.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex items-center gap-1 w-16 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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

          {/* ── Studios Tab ── */}
          <TabsContent value="studios" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2"><MapPin className="h-4 w-4" />Studio Locations</CardTitle>
                <CardDescription>These locations appear in the assessment form's studio dropdown.</CardDescription>
              </CardHeader>
              <CardContent className="py-4 space-y-4">
                <div className="space-y-2">
                  {locations.map((loc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border group">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium">{loc}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => saveLocations(locations.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {locations.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No locations added yet.</p>}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Add new studio location…" className="bg-muted/30"
                    onKeyDown={e => { if (e.key === 'Enter' && newLocation.trim()) { saveLocations([...locations, newLocation.trim()]); setNewLocation(''); } }} />
                  <Button disabled={!newLocation.trim()} onClick={() => { saveLocations([...locations, newLocation.trim()]); setNewLocation(''); }} className="gap-1.5">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Sessions Tab ── */}
          <TabsContent value="sessions" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2"><ClipboardList className="h-4 w-4" />Session / Class Types</CardTitle>
                <CardDescription>These options appear in the "Class / Session Type" dropdown in the assessment form.</CardDescription>
              </CardHeader>
              <CardContent className="py-4 space-y-4">
                <div className="space-y-2">
                  {sessions.map((session, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border group">
                      <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium">{session}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => saveSessions(sessions.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {sessions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No session types added yet.</p>}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Input value={newSession} onChange={e => setNewSession(e.target.value)} placeholder="Add new session type…" className="bg-muted/30"
                    onKeyDown={e => { if (e.key === 'Enter' && newSession.trim()) { saveSessions([...sessions, newSession.trim()]); setNewSession(''); } }} />
                  <Button disabled={!newSession.trim()} onClick={() => { saveSessions([...sessions, newSession.trim()]); setNewSession(''); }} className="gap-1.5">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Appearance Tab ── */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2"><Palette className="h-4 w-4" />Theme & Appearance</CardTitle>
                <CardDescription>Customise the app's accent color and branding. Changes apply instantly across the entire app.</CardDescription>
              </CardHeader>
              <CardContent className="py-5 space-y-6">
                {/* Primary color */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Primary Accent Color</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input type="color" value={primaryHex} onChange={e => setPrimaryHex(e.target.value)}
                        className="w-14 h-14 rounded-xl border-2 border-border cursor-pointer bg-transparent p-1" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md border border-border flex-shrink-0" style={{ backgroundColor: primaryHex }} />
                        <Input value={primaryHex} onChange={e => setPrimaryHex(e.target.value)} className="font-mono text-sm bg-muted/30 max-w-[140px] h-8" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">This changes buttons, active states, highlights, and more.</p>
                    </div>
                    {/* Color presets */}
                    <div className="flex gap-2 flex-wrap">
                      {['#8B0000', '#1a1a2e', '#1e3a5f', '#2d6a4f', '#7B2D8B', '#c05621'].map(hex => (
                        <button key={hex} onClick={() => setPrimaryHex(hex)} title={hex}
                          className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${primaryHex === hex ? 'border-foreground shadow-md' : 'border-transparent'}`}
                          style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="p-4 bg-muted/20 rounded-xl border space-y-2">
                    <p className="text-xs text-muted-foreground font-medium mb-3">Preview</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="h-8 px-4 rounded-lg text-sm font-semibold flex items-center text-white" style={{ backgroundColor: primaryHex }}>Button</div>
                      <div className="h-8 px-4 rounded-lg text-sm font-semibold flex items-center border-2" style={{ color: primaryHex, borderColor: primaryHex }}>Outline</div>
                      <Badge style={{ backgroundColor: primaryHex + '20', color: primaryHex, borderColor: primaryHex + '40' }} className="border">Badge</Badge>
                      <div className="h-2 rounded-full flex-1 min-w-[80px]" style={{ backgroundColor: primaryHex + '30' }}>
                        <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: primaryHex }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Organisation Logo URL</Label>
                  <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://…/logo.png" className="bg-muted/30" />
                  {logoUrl && (
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border">
                      <img src={logoUrl} alt="Logo preview" className="h-10 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-xs text-muted-foreground">Logo preview — used in emails and PDF reports</span>
                    </div>
                  )}
                </div>

                <Button onClick={saveAppearance} disabled={saving} className="w-full sm:w-auto gap-2">
                  <Palette className="h-4 w-4" />
                  {saving ? 'Applying…' : 'Save & Apply Appearance'}
                </Button>
              </CardContent>
            </Card>

            {/* Performance Bands reference */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2"><Info className="h-4 w-4" />Performance Bands Reference</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-2">
                  {PERFORMANCE_BANDS.map(b => (
                    <div key={b.label} className={`flex items-center gap-3 p-3 rounded-xl border ${b.bgClass}`}>
                      <div className={`text-sm font-black w-28 ${b.colorClass}`}>{b.label}</div>
                      <div className={`text-xs ${b.colorClass} opacity-70`}>{b.range}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2"><Shield className="h-4 w-4" />Security</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border">
                  <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Admin Code: <span className="font-mono">{ADMIN_CODE}</span></p>
                    <p className="text-[10px] text-muted-foreground">Controls access to Hub and Config. To change it, update ADMIN_CODE in constants.ts.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {(addOpen || editTarget) && (
        <TrainerDialog trainer={editTarget} onClose={() => { setAddOpen(false); setEditTarget(null); }} onSaved={() => { setAddOpen(false); setEditTarget(null); loadAll(); }} />
      )}
      {importOpen && <BulkImportDialog onClose={() => setImportOpen(false)} onDone={() => { setImportOpen(false); loadAll(); }} />}

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove Trainer?</AlertDialogTitle><AlertDialogDescription>This will remove the trainer from the roster and they won't appear in future assessments.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {selectedIds.size} Trainers?</AlertDialogTitle><AlertDialogDescription>This will permanently remove all selected trainers. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">Delete All</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
