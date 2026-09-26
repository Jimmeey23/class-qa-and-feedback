import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssessments, getTrainers, GetAssessmentsOutputType, deleteAssessment } from '@/api/client';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Input } from '@project/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { Skeleton } from '@project/components/ui/skeleton';
import { Progress } from '@project/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@project/components/ui/alert-dialog';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { Plus, Search, BarChart2, ClipboardList, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Pencil, Trash2, Eye, ArrowLeft, Star, Users, Settings, Minus, AlertTriangle, Award, Lightbulb, MapPin } from 'lucide-react';
import { CRITERIA, SCORE_FIELD_MAP, getBand, getAvatarColor, getInitials, PERFORMANCE_BANDS } from '../data/constants';
import { pctColor } from '../components/ScoreInput';
import HubPasswordGate from '../components/hub/HubPasswordGate';
import HubEditDialog from '../components/hub/HubEditDialog';
import { format, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { toast } from 'sonner';

type Assessment = GetAssessmentsOutputType['assessments'][0];

// Correct 13-key mapping aligned with CRITERIA order
const SCORE_KEYS = CRITERIA.map(c => SCORE_FIELD_MAP[c.id]) as string[];
const SHORT_LABELS = ['Pre', 'Verbal', 'Visual', 'Injury', 'Level', 'USP', 'Music', 'Space', 'Time', 'Names', 'Energy', 'Mindful', 'Post'];
const BAND_COLORS: Record<string, string> = { Exceptional: '#10b981', Strong: '#3b82f6', Refinement: '#f59e0b', Coaching: '#f97316', 'Needs Help': '#ef4444' };

export default function HubPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('hubAuth') === 'ok');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterTrainer, setFilterTrainer] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [expandedTrainer, setExpandedTrainer] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Assessment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [trainerPhotoMap, setTrainerPhotoMap] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getAssessments({}).then(({ assessments: a }) => { setAssessments(a); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { if (authed) load(); }, [authed]);
  useEffect(() => {
    getTrainers({}).then(({ trainers }) => {
      const map: Record<string, string> = {};
      trainers.forEach(t => { if (t.photoUrl) map[t.name] = t.photoUrl; });
      setTrainerPhotoMap(map);
    }).catch(() => {});
  }, []);

  const unlock = () => { setAuthed(true); sessionStorage.setItem('hubAuth', 'ok'); };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteAssessment({ id: deleteId }); toast.success('Deleted'); setAssessments(a => a.filter(x => x.id !== deleteId)); }
    catch { toast.error('Delete failed'); } finally { setDeleteId(null); }
  };

  const uniqueLocations = useMemo(() => [...new Set(assessments.map(a => a.location))].sort(), [assessments]);
  const uniqueTrainers = useMemo(() => [...new Set(assessments.map(a => a.trainerName))].sort(), [assessments]);

  const filtered = useMemo(() => {
    let list = [...assessments];
    if (search) list = list.filter(a => [a.trainerName, a.sessionName, a.location].some(f => f?.toLowerCase().includes(search.toLowerCase())));
    if (filterLocation) list = list.filter(a => a.location === filterLocation);
    if (filterTrainer) list = list.filter(a => a.trainerName === filterTrainer);
    return sortBy === 'date' ? list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()) : list.sort((a, b) => b.totalScore - a.totalScore);
  }, [assessments, search, filterLocation, filterTrainer, sortBy]);

  const trainerStats = useMemo(() => {
    const map: Record<string, Assessment[]> = {};
    assessments.forEach(a => { if (!map[a.trainerName]) map[a.trainerName] = []; map[a.trainerName].push(a); });
    return Object.entries(map).map(([name, recs]) => {
      const sorted = [...recs].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      const avg = recs.reduce((s, r) => s + r.totalScore, 0) / recs.length;
      const latest3 = sorted.slice(0, 3);
      const prev3 = sorted.slice(3, 6);
      const latestAvg = latest3.reduce((s, r) => s + r.totalScore, 0) / latest3.length;
      const prevAvg = prev3.length ? prev3.reduce((s, r) => s + r.totalScore, 0) / prev3.length : latestAvg;
      const trend = prev3.length ? latestAvg - prevAvg : 0;
      const radarData = CRITERIA.map((c, i) => ({
        subject: SHORT_LABELS[i],
        value: Math.round(recs.reduce((s, r) => s + (((r[SCORE_KEYS[i] as keyof Assessment] as number) ?? 0) / c.maxPts) * 100, 0) / recs.length),
      }));
      return { name, records: sorted, avg, count: recs.length, trend, radarData };
    }).sort((a, b) => b.avg - a.avg);
  }, [assessments]);

  const trendData = useMemo(() => {
    const byWeek: Record<string, number[]> = {};
    assessments.forEach(a => {
      if (!a.submittedAt) return;
      const wk = format(startOfWeek(parseISO(a.submittedAt)), 'MMM d');
      if (!byWeek[wk]) byWeek[wk] = [];
      byWeek[wk].push(a.totalScore);
    });
    return Object.entries(byWeek).map(([week, scores]) => ({
      week, avg: Math.round(scores.reduce((s, n) => s + n, 0) / scores.length * 10) / 10, count: scores.length,
    })).slice(-12);
  }, [assessments]);

  const sessionBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    assessments.forEach(a => {
      if (!map[a.sessionName]) map[a.sessionName] = { count: 0, total: 0 };
      map[a.sessionName].count++;
      map[a.sessionName].total += a.totalScore;
    });
    return Object.entries(map).map(([name, { count, total }]) => ({ name, count, avg: Math.round((total / count) * 10) / 10 })).sort((a, b) => b.avg - a.avg);
  }, [assessments]);

  const locationBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    assessments.forEach(a => {
      if (!map[a.location]) map[a.location] = { count: 0, total: 0 };
      map[a.location].count++;
      map[a.location].total += a.totalScore;
    });
    return Object.entries(map).map(([name, { count, total }]) => ({ name, count, avg: Math.round((total / count) * 10) / 10 })).sort((a, b) => b.avg - a.avg);
  }, [assessments]);

  // Insights: criterion averages across all assessments
  const criterionInsights = useMemo(() => {
    if (!assessments.length) return [];
    return CRITERIA.map((c, i) => {
      const avg = assessments.reduce((s, r) => s + (((r[SCORE_KEYS[i] as keyof Assessment] as number) ?? 0) / c.maxPts) * 100, 0) / assessments.length;
      const belowThreshold = assessments.filter(r => (((r[SCORE_KEYS[i] as keyof Assessment] as number) ?? 0) / c.maxPts) * 100 < 60).length;
      return { label: c.label, shortLabel: SHORT_LABELS[i], avg, belowThreshold, pct: avg };
    }).sort((a, b) => a.avg - b.avg);
  }, [assessments]);

  const avgScore = assessments.length ? assessments.reduce((s, a) => s + a.totalScore, 0) / assessments.length : 0;
  const topScore = assessments.length ? Math.max(...assessments.map(a => a.totalScore)) : 0;
  const recentAssessments = useMemo(() => {
    const cutoff = subWeeks(new Date(), 4);
    return assessments.filter(a => a.submittedAt && parseISO(a.submittedAt) >= cutoff).length;
  }, [assessments]);

  if (!authed) return <HubPasswordGate onUnlock={unlock} />;

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Physique 57</div>
              <h1 className="text-lg font-black leading-tight">Assessment Hub</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/config')} title="Admin Config"><Settings className="h-4 w-4" /></Button>
            <Button onClick={() => navigate('/')} className="gap-2 text-sm shadow-sm"><Plus className="h-4 w-4" /><span className="hidden sm:inline">New Assessment</span></Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats row */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: ClipboardList, label: 'Total Assessments', value: assessments.length.toString(), sub: `${recentAssessments} in last 4 weeks`, color: 'text-primary', bg: 'bg-primary/10' },
              { icon: BarChart2, label: 'Overall Average', value: avgScore.toFixed(1), sub: '/ 100 pts', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Star, label: 'Top Score', value: topScore ? topScore.toFixed(0) : '—', sub: getBand(topScore).label, color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: Users, label: 'Trainers Assessed', value: uniqueTrainers.length.toString(), sub: `across ${uniqueLocations.length} studio${uniqueLocations.length !== 1 ? 's' : ''}`, color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map(({ icon: Icon, label, value, sub, color, bg }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-4 flex flex-col gap-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} mb-1`}><Icon className={`h-4 w-4 ${color}`} /></div>
                    <div className="text-2xl font-black leading-none">{value}</div>
                    <div className="text-xs font-semibold text-foreground/80">{label}</div>
                    <div className="text-[10px] text-muted-foreground">{sub}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <Tabs defaultValue="records">
          <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex h-10 mb-1">
            <TabsTrigger value="records" className="text-xs sm:text-sm gap-1.5"><ClipboardList className="h-3.5 w-3.5 hidden sm:block" />Records</TabsTrigger>
            <TabsTrigger value="trainers" className="text-xs sm:text-sm gap-1.5"><Users className="h-3.5 w-3.5 hidden sm:block" />Trainers</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm gap-1.5"><BarChart2 className="h-3.5 w-3.5 hidden sm:block" />Analytics</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm gap-1.5"><Lightbulb className="h-3.5 w-3.5 hidden sm:block" />Insights</TabsTrigger>
          </TabsList>

          {/* ── Records ── */}
          <TabsContent value="records" className="space-y-3 mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-10 bg-muted/30" placeholder="Search trainer, session, location…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="sm:w-48 h-10 bg-muted/30"><SelectValue placeholder="All Locations" /></SelectTrigger>
                <SelectContent>{uniqueLocations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={filterTrainer} onValueChange={setFilterTrainer}>
                <SelectTrigger className="sm:w-40 h-10 bg-muted/30"><SelectValue placeholder="All Trainers" /></SelectTrigger>
                <SelectContent>{uniqueTrainers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={v => setSortBy(v as 'date' | 'score')}>
                <SelectTrigger className="sm:w-36 h-10 bg-muted/30"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="date">Latest First</SelectItem><SelectItem value="score">Highest Score</SelectItem></SelectContent>
              </Select>
              {(filterLocation || filterTrainer || search) && <Button variant="ghost" size="sm" className="h-10" onClick={() => { setFilterLocation(''); setFilterTrainer(''); setSearch(''); }}>Clear</Button>}
            </div>
            <div className="text-xs text-muted-foreground px-1">{filtered.length} record{filtered.length !== 1 ? 's' : ''} {(filterLocation || filterTrainer || search) ? '(filtered)' : ''}</div>
            <div className="space-y-2">
              {loading ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
                filtered.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No assessments found. <Button variant="link" onClick={() => navigate('/')}>Create one.</Button></CardContent></Card>
                ) : filtered.map(a => <AssessmentRow key={a.id} a={a} photoUrl={trainerPhotoMap[a.trainerName]} onEdit={() => setEditTarget(a)} onDelete={() => setDeleteId(a.id)} onView={() => navigate(`/report/${a.id}`)} />)}
            </div>
          </TabsContent>

          {/* ── Trainers ── */}
          <TabsContent value="trainers" className="space-y-3 mt-4">
            {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />) :
              trainerStats.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No assessments yet.</CardContent></Card>
              ) : trainerStats.map(({ name, records, avg, count, trend, radarData }) => {
                const band = getBand(avg);
                const isOpen = expandedTrainer === name;
                return (
                  <div key={name} className="border rounded-2xl overflow-hidden shadow-sm bg-background hover:shadow-md transition-shadow">
                    <button className="w-full flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors text-left" onClick={() => setExpandedTrainer(isOpen ? null : name)}>
                      {trainerPhotoMap[name] ? (
                        <img src={trainerPhotoMap[name]} alt={name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-sm border-2 border-border/30" />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm ${getAvatarColor(name)}`}>{getInitials(name)}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold">{name}</div>
                        <div className="text-xs text-muted-foreground">{count} assessment{count !== 1 ? 's' : ''}</div>
                        <div className="flex items-center gap-2 mt-1.5" style={{ '--primary': pctColor(avg).hsl } as React.CSSProperties}>
                          <Progress value={avg} className="h-1.5 flex-1 max-w-[160px]" />
                          <span className={`text-xs font-semibold ${pctColor(avg).text}`}>{avg.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 mr-1">
                        <div className={`text-3xl font-black ${band.colorClass}`}>{avg.toFixed(1)}</div>
                        <Badge variant="outline" className={`text-[10px] ${band.colorClass} ${band.bgClass} mt-0.5`}>{band.label}</Badge>
                        {count >= 2 && (
                          <div className={`flex items-center justify-end gap-0.5 mt-1 text-[10px] font-semibold ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            {trend !== 0 ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}` : 'stable'}
                          </div>
                        )}
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 32 }} className="overflow-hidden">
                          <div className="border-t grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border bg-muted/5">
                            <div className="p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Performance Radar</p>
                              <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={radarData} margin={{ top: 8, right: 20, left: 20, bottom: 8 }}>
                                  <PolarGrid strokeOpacity={0.3} />
                                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="p-4 space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Average by Criterion</p>
                              {CRITERIA.map((c, i) => {
                                const avgPct = records.reduce((s, r) => s + (((r[SCORE_KEYS[i] as keyof Assessment] as number) ?? 0) / c.maxPts) * 100, 0) / records.length;
                                const col = pctColor(avgPct);
                                return (
                                  <div key={c.id} className="flex items-center gap-2 text-xs">
                                    <div className="w-16 truncate text-muted-foreground flex-shrink-0 text-[10px]">{SHORT_LABELS[i]}</div>
                                    <div style={{ '--primary': col.hsl } as React.CSSProperties} className="flex-1"><Progress value={avgPct} className="h-1.5" /></div>
                                    <span className={`font-bold w-8 text-right text-[11px] ${col.text}`}>{avgPct.toFixed(0)}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="border-t">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 pt-4 pb-2">Full Assessment History</p>
                            <div className="overflow-x-auto pb-4 px-4">
                              <table className="w-full text-xs border-collapse" style={{ minWidth: 1100 }}>
                                <thead>
                                  <tr className="bg-muted/40 text-muted-foreground">
                                    <th className="text-left p-2 pl-3 font-semibold rounded-l-lg whitespace-nowrap border-r border-border/30">#</th>
                                    <th className="text-left p-2 font-semibold whitespace-nowrap border-r border-border/30">Date</th>
                                    <th className="text-left p-2 font-semibold whitespace-nowrap border-r border-border/30">Evaluator</th>
                                    <th className="text-left p-2 font-semibold whitespace-nowrap border-r border-border/30">Session</th>
                                    {CRITERIA.map((c, i) => (
                                      <th key={c.id} className="text-center p-2 font-semibold whitespace-nowrap border-r border-border/30">
                                        <div>{SHORT_LABELS[i]}</div><div className="font-normal text-muted-foreground/60">/{c.maxPts}</div>
                                      </th>
                                    ))}
                                    <th className="text-center p-2 font-bold whitespace-nowrap border-r border-border/30">Total</th>
                                    <th className="text-left p-2 font-semibold rounded-r-lg whitespace-nowrap"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {records.map((a, idx) => {
                                    const b = getBand(a.totalScore);
                                    return (
                                      <tr key={a.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                        <td className="p-2 pl-3 text-muted-foreground border-r border-border/20">{idx + 1}</td>
                                        <td className="p-2 whitespace-nowrap border-r border-border/20 font-medium">{a.submittedAt ? format(parseISO(a.submittedAt), 'dd MMM yy') : '—'}</td>
                                        <td className="p-2 whitespace-nowrap border-r border-border/20 text-muted-foreground">{a.evaluatorName}</td>
                                        <td className="p-2 whitespace-nowrap border-r border-border/20 text-muted-foreground">{a.sessionName}</td>
                                        {CRITERIA.map((c, i) => {
                                          const score = (a[SCORE_KEYS[i] as keyof Assessment] as number) ?? 0;
                                          const p = (score / c.maxPts) * 100;
                                          const col = pctColor(p);
                                          return (
                                            <td key={c.id} className="p-2 text-center border-r border-border/20">
                                              <span className={`font-bold ${col.text}`}>{score}</span>
                                            </td>
                                          );
                                        })}
                                        <td className="p-2 text-center border-r border-border/20"><span className={`font-black text-sm ${b.colorClass}`}>{a.totalScore.toFixed(0)}</span></td>
                                        <td className="p-2">
                                          <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigate(`/report/${a.id}`)}><Eye className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditTarget(a)}><Pencil className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteId(a.id)}><Trash2 className="h-3 w-3" /></Button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
          </TabsContent>

          {/* ── Analytics ── */}
          <TabsContent value="analytics" className="mt-4 space-y-4">
            {loading ? (
              <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
            ) : (
              <>
                <Card className="shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Score Trend — Weekly Average</CardTitle></CardHeader>
                  <CardContent>
                    {trendData.length < 2 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Need more data for trend chart</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={trendData} margin={{ top: 8, right: 16, left: -16, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`${v} pts`, 'Avg Score']} />
                          <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Average Score by Trainer</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <div style={{ minWidth: Math.max(trainerStats.length * 56, 300) }}>
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={trainerStats} margin={{ top: 8, right: 8, left: -24, bottom: 36 }}>
                              <XAxis dataKey="name" tick={{ fontSize: 8 }} tickFormatter={n => n.split(' ')[0]} angle={-35} textAnchor="end" interval={0} />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                              <Tooltip formatter={(v: number) => [`${v.toFixed(1)} pts`, 'Avg']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                              <Bar dataKey="avg" radius={[5, 5, 0, 0]}>
                                {trainerStats.map((ts, i) => <Cell key={i} fill={BAND_COLORS[getBand(ts.avg).label] ?? 'hsl(var(--primary))'} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">By Session Type</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={sessionBreakdown} margin={{ top: 8, right: 8, left: -24, bottom: 36 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" interval={0} tickFormatter={n => n.replace('Strength Lab - ', '')} />
                          <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 9 }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar yAxisId="left" dataKey="avg" name="Avg Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="count" name="Count" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Performance Distribution */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Performance Distribution</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-2">
                        {PERFORMANCE_BANDS.map(b => {
                          const cnt = assessments.filter(a => a.totalScore >= b.min && a.totalScore < (b.min === 0 ? 60 : b.min === 60 ? 70 : b.min === 70 ? 80 : b.min === 80 ? 90 : 101)).length;
                          const pct = assessments.length ? (cnt / assessments.length) * 100 : 0;
                          const barColor = b.label === 'Exceptional' ? 'bg-emerald-500' : b.label === 'Good' ? 'bg-blue-500' : b.label === 'Average' ? 'bg-amber-500' : b.label === 'Poor' ? 'bg-orange-500' : 'bg-rose-500';
                          return (
                            <div key={b.label} className={`rounded-xl p-3 text-center border ${b.bgClass}`}>
                              <div className={`text-2xl font-black ${b.colorClass}`}>{cnt}</div>
                              <div className={`text-[10px] font-bold mt-0.5 ${b.colorClass}`}>{b.label}</div>
                              <div className="text-[9px] text-muted-foreground">{b.range}</div>
                              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mt-1.5"><div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location breakdown */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">By Studio / Location</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {locationBreakdown.map(({ name, avg, count }) => {
                        const col = pctColor(avg);
                        return (
                          <div key={name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium truncate flex-1 mr-2"><MapPin className="h-3 w-3 inline mr-1 text-muted-foreground" />{name}</span>
                              <span className="text-muted-foreground">{count} reviews</span>
                              <span className={`ml-2 font-black w-8 text-right ${col.text}`}>{avg.toFixed(1)}</span>
                            </div>
                            <div style={{ '--primary': col.hsl } as React.CSSProperties}>
                              <Progress value={avg} className="h-1.5" />
                            </div>
                          </div>
                        );
                      })}
                      {locationBreakdown.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data</p>}
                    </CardContent>
                  </Card>
                </div>

                {/* Criterion heatmap */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Criterion Breakdown — All Trainers (% of Max)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse" style={{ minWidth: 800 }}>
                        <thead>
                          <tr>
                            <th className="text-left p-2 text-muted-foreground font-semibold w-24">Trainer</th>
                            {CRITERIA.map((_, i) => <th key={i} className="text-center p-1.5 text-muted-foreground font-semibold text-[10px]">{SHORT_LABELS[i]}</th>)}
                            <th className="text-center p-2 text-muted-foreground font-semibold">Avg</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trainerStats.map(({ name, records, avg }) => (
                            <tr key={name} className="border-t border-border/20 hover:bg-muted/10">
                              <td className="p-2 font-medium truncate max-w-[96px] text-[11px]">{name.split(' ')[0]}</td>
                              {CRITERIA.map((c, i) => {
                                const pct = records.reduce((s, r) => s + (((r[SCORE_KEYS[i] as keyof Assessment] as number) ?? 0) / c.maxPts) * 100, 0) / records.length;
                                const bg = pct >= 80 ? 'bg-emerald-100 text-emerald-700' : pct >= 60 ? 'bg-blue-100 text-blue-700' : pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
                                return (
                                  <td key={c.id} className="p-1 text-center">
                                    <span className={`inline-block px-1 py-0.5 rounded text-[10px] font-bold ${bg}`}>{pct.toFixed(0)}%</span>
                                  </td>
                                );
                              })}
                              <td className="p-2 text-center"><span className={`font-black text-xs ${getBand(avg).colorClass}`}>{avg.toFixed(1)}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ── Insights ── */}
          <TabsContent value="insights" className="mt-4 space-y-4">
            {loading ? (
              <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
            ) : assessments.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No assessment data yet.</CardContent></Card>
            ) : (
              <>
                {/* Criterion health */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="shadow-sm border-rose-200/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Weakest Criteria
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {criterionInsights.slice(0, 5).map(({ label, avg, belowThreshold }) => {
                        const col = pctColor(avg);
                        return (
                          <div key={label} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{label}</span>
                              <div className="flex items-center gap-2">
                                {belowThreshold > 0 && <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">{belowThreshold} below 60%</span>}
                                <span className={`font-black ${col.text}`}>{avg.toFixed(0)}%</span>
                              </div>
                            </div>
                            <div style={{ '--primary': col.hsl } as React.CSSProperties}>
                              <Progress value={avg} className="h-1.5" />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-emerald-200/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-500" /> Strongest Criteria
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[...criterionInsights].reverse().slice(0, 5).map(({ label, avg }) => {
                        const col = pctColor(avg);
                        return (
                          <div key={label} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{label}</span>
                              <span className={`font-black ${col.text}`}>{avg.toFixed(0)}%</span>
                            </div>
                            <div style={{ '--primary': col.hsl } as React.CSSProperties}>
                              <Progress value={avg} className="h-1.5" />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Trainer trends */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Trainer Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {trainerStats.map(({ name, avg, count, trend }) => {
                        const band = getBand(avg);
                        const trendIcon = trend > 1 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : trend < -1 ? <TrendingDown className="h-3.5 w-3.5 text-rose-500" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
                        const trendLabel = trend > 1 ? 'Improving' : trend < -1 ? 'Declining' : 'Stable';
                        const trendColor = trend > 1 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : trend < -1 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-muted-foreground bg-muted/30 border-border';
                        return (
                          <div key={name} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/10 hover:bg-muted/20 transition-colors">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${getAvatarColor(name)}`}>{getInitials(name)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{name}</div>
                              <div className={`text-sm font-black ${band.colorClass}`}>{avg.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">/ 100</span></div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              {count >= 2 ? (
                                <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${trendColor}`}>
                                  {trendIcon} {trendLabel}
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">{count} review</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Needs attention */}
                {trainerStats.filter(t => t.avg < 70).length > 0 && (
                  <Card className="shadow-sm border-amber-200/60 bg-amber-50/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Coaching Priority
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-amber-700/80 mb-3">Trainers with average score below 70 — recommend prioritising coaching sessions.</p>
                      {trainerStats.filter(t => t.avg < 70).map(({ name, avg, count }) => (
                        <div key={name} className="flex items-center gap-3 p-2.5 rounded-lg bg-background border border-amber-200/60">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${getAvatarColor(name)}`}>{getInitials(name)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold">{name}</div>
                            <div className="text-xs text-muted-foreground">{count} assessment{count !== 1 ? 's' : ''}</div>
                          </div>
                          <div className={`text-xl font-black ${getBand(avg).colorClass}`}>{avg.toFixed(1)}</div>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/')}>Assess</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Top performers podium */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" /> Top Performers Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {trainerStats.slice(0, 8).map(({ name, avg, count }, i) => {
                        const band = getBand(avg);
                        const medals = ['🥇', '🥈', '🥉'];
                        return (
                          <div key={name} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors hover:bg-muted/10 ${i < 3 ? 'bg-muted/20 border-border' : 'bg-background'}`}>
                            <span className="text-lg w-6 text-center flex-shrink-0">{medals[i] ?? <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${getAvatarColor(name)}`}>{getInitials(name)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{name}</div>
                              <div className="text-xs text-muted-foreground">{count} review{count !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0" style={{ '--primary': pctColor(avg).hsl } as React.CSSProperties}>
                              <Progress value={avg} className="w-20 h-1.5" />
                              <span className={`text-sm font-black w-10 text-right ${band.colorClass}`}>{avg.toFixed(1)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {editTarget && <HubEditDialog assessment={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />}
      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Assessment?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone and will permanently remove the record.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AssessmentRow({ a, onEdit, onDelete, onView, photoUrl }: { a: Assessment; onEdit: () => void; onDelete: () => void; onView: () => void; photoUrl?: string }) {
  const band = getBand(a.totalScore);
  return (
    <div className="flex items-center gap-3 bg-background border rounded-xl p-3 hover:shadow-sm hover:border-primary/30 transition-all group">
      {photoUrl ? (
        <img src={photoUrl} alt={a.trainerName} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-border/30" />
      ) : (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${getAvatarColor(a.trainerName)}`}>{getInitials(a.trainerName)}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{a.trainerName}</div>
        <div className="text-xs text-muted-foreground truncate">{a.sessionName} · {a.location}</div>
        <div className="text-xs text-muted-foreground">{a.submittedAt ? format(parseISO(a.submittedAt), 'dd MMM yyyy, h:mm a') : '—'} · {a.evaluatorName}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-2xl font-black ${band.colorClass}`}>{a.totalScore.toFixed(0)}</div>
        <Badge variant="outline" className={`text-[9px] ${band.colorClass} ${band.bgClass}`}>{band.label}</Badge>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onView}><Eye className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}
