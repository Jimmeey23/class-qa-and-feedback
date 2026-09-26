import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@project/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Progress } from '@project/components/ui/progress';
import { ArrowLeft, ArrowRight, Send, ChevronLeft, LayoutDashboard, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { CRITERIA, getGroupForLocation } from '../data/constants';
import { FormState, initialFormState, emptySection } from '../types/assessment';
import { submitAssessment, getTrainers, GetTrainersOutputType } from '@/api/client';
import StepDetails from '../components/form/StepDetails';
import StepCriterion from '../components/form/StepCriterion';
import StepFeedback from '../components/form/StepFeedback';
import StepReview from '../components/form/StepReview';

export type TrainerOption = GetTrainersOutputType['trainers'][0];

const STEP_LABELS = ['Class Details', ...CRITERIA.map((c, i) => `${i + 2}. ${c.label}`), 'Qualitative Feedback', 'Review & Submit'];
const TOTAL_STEPS = STEP_LABELS.length;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0, scale: 0.97 }),
};

export default function FormPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<FormState>(initialFormState());
  const [submitting, setSubmitting] = useState(false);
  const [allTrainers, setAllTrainers] = useState<TrainerOption[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getTrainers({}).then(({ trainers }) => setAllTrainers(trainers)).catch(() => {});
  }, []);

  const criterionIndex = step - 1;
  const isCriterionStep = step >= 1 && step <= CRITERIA.length;
  const isFeedbackStep = step === CRITERIA.length + 1;
  const isReviewStep = step === TOTAL_STEPS - 1;
  const progress = (step / (TOTAL_STEPS - 1)) * 100;
  const criterion = CRITERIA[criterionIndex];

  const locationGroup = form.location ? getGroupForLocation(form.location) : null;
  const filteredTrainers = locationGroup ? allTrainers.filter(t => t.studioGroup === locationGroup) : [];

  const canProceed = () => {
    if (step === 0) return !!(form.trainerName && form.evaluatorName && form.location && form.sessionName && form.classDate);
    if (isCriterionStep && criterion) return (form.scores[criterion.id] ?? 0) > 0;
    return true;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.key === 'ArrowRight') && step < TOTAL_STEPS - 1 && !isReviewStep) {
        const ok = step === 0
          ? !!(form.trainerName && form.evaluatorName && form.location && form.sessionName && form.classDate)
          : isCriterionStep && criterion ? (form.scores[criterion.id] ?? 0) > 0 : true;
        if (ok) { setDir(1); setStep(s => s + 1); }
      }
      if (e.key === 'ArrowLeft' && step > 0 && !isReviewStep) {
        setDir(-1); setStep(s => s - 1);
      }
      if (isCriterionStep && criterion) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setForm(f => ({ ...f, scores: { ...f.scores, [criterion.id]: Math.min((f.scores[criterion.id] ?? 0) + 0.5, criterion.maxPts) } }));
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setForm(f => ({ ...f, scores: { ...f.scores, [criterion.id]: Math.max((f.scores[criterion.id] ?? 0) - 0.5, 0) } }));
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, form, isCriterionStep, criterion, isReviewStep]);

  const goNext = () => {
    if (!canProceed()) {
      if (isCriterionStep) toast.error('Please enter a score before continuing');
      else toast.error('Please fill in all required fields (marked with *)');
      return;
    }
    setDir(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    setDir(-1);
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { id } = await submitAssessment({
        trainerName: form.trainerName, evaluatorName: form.evaluatorName,
        location: form.location, sessionName: form.sessionName, classDate: form.classDate,
        scores: {
          preClass: form.scores.preClass ?? 0, clientConnection: form.scores.clientConnection ?? 0,
          uspIntegration: form.scores.uspIntegration ?? 0, mapping: form.scores.mapping ?? 0,
          musicalArc: form.scores.musicalArc ?? 0, coachingDelivery: form.scores.coachingDelivery ?? 0,
          motivation: form.scores.motivation ?? 0, timeManagement: form.scores.timeManagement ?? 0, postClass: form.scores.postClass ?? 0,
        },
        sections: form.sections, strengths: form.strengths,
        areasForImprovement: form.areasForImprovement, coachingActionPlan: form.coachingActionPlan,
      });
      toast.success('Assessment submitted! Report is ready.');
      navigate(`/report/${id}`);
    } catch { toast.error('Submission failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const updateSection = (id: string, patch: Partial<typeof form.sections[string]>) =>
    setForm(f => ({ ...f, sections: { ...f.sections, [id]: { ...(f.sections[id] ?? emptySection()), ...patch } } }));

  const cardTitle = step === 0 ? 'Class Details'
    : isCriterionStep ? criterion.label
    : isFeedbackStep ? 'Qualitative Feedback'
    : 'Review & Submit';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={step > 0 ? goBack : undefined} disabled={step === 0}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate">{STEP_LABELS[step]}</span>
              <span className="text-[11px] font-bold tabular-nums text-muted-foreground flex-shrink-0 ml-2">{step + 1} / {TOTAL_STEPS}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Admin Config" onClick={() => navigate('/config')}>
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Assessment Hub" onClick={() => navigate('/hub')}>
              <LayoutDashboard className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-10">
        {/* Hero — step 0 only */}
        <AnimatePresence>
          {step === 0 && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.35 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="inline-flex flex-col items-center"
              >
                <div className="text-xs font-black uppercase tracking-[0.35em] text-primary mb-3 opacity-80">PHYSIQUE 57</div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">Training Quality</h1>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-primary mt-1">Assessment</h1>
                <div className="h-px w-16 bg-border mt-4 mb-4 mx-auto" />
                <p className="text-sm text-muted-foreground">Performance Review & Feedback Tool</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-6 mt-5"
              >
                {[{ label: '9 Criteria', color: 'bg-primary' }, { label: '100 Points Total', color: 'bg-emerald-500' }, { label: 'Instant Report', color: 'bg-violet-500' }].map(({ label, color }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`w-1.5 h-1.5 rounded-full ${color} flex-shrink-0`} />{label}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated step card */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Card className="shadow-xl border-border/50 overflow-hidden">
              <CardHeader className="pb-4 border-b bg-gradient-to-r from-muted/30 to-muted/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl font-bold">{cardTitle}</CardTitle>
                    {isCriterionStep && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Section {criterionIndex + 1} of {CRITERIA.length} · Max {criterion.maxPts} points
                      </p>
                    )}
                  </div>
                  {isCriterionStep && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-black text-primary tabular-nums">{form.scores[criterion.id] ?? 0}</div>
                      <div className="text-[10px] text-muted-foreground">/ {criterion.maxPts}</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {step === 0 && (
                  <StepDetails form={form} setForm={setForm} trainers={filteredTrainers} />
                )}
                {isCriterionStep && (
                  <StepCriterion
                    criterion={criterion}
                    stepNumber={criterionIndex + 1}
                    totalCriteria={CRITERIA.length}
                    score={form.scores[criterion.id] ?? 0}
                    section={form.sections[criterion.id] ?? emptySection()}
                    onScoreChange={v => setForm(f => ({ ...f, scores: { ...f.scores, [criterion.id]: v } }))}
                    onSectionChange={s => updateSection(criterion.id, s)}
                  />
                )}
                {isFeedbackStep && <StepFeedback form={form} setForm={setForm} />}
                {isReviewStep && <StepReview form={form} />}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <motion.div layout className="flex gap-3 mt-4">
          {step > 0 && (
            <Button variant="outline" className="flex-1 gap-2 h-11" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />Back
            </Button>
          )}
          {isReviewStep ? (
            <Button
              className="flex-1 gap-2 h-12 text-base font-semibold shadow-lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Send className="h-5 w-5" />
              {submitting ? 'Submitting…' : 'Submit & Send Report'}
            </Button>
          ) : (
            <Button className="flex-1 gap-2 h-11 shadow-sm font-semibold" onClick={goNext}>
              Next<ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
