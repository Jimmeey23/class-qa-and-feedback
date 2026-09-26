import { CRITERIA, getBand, PERFORMANCE_BANDS, getInitials, getAvatarColor } from '../data/constants';
import { GetAssessmentOutputType } from '@/api/client';
import { format } from 'date-fns';

type Assessment = NonNullable<GetAssessmentOutputType['assessment']>;
type Props = { a: Assessment; trainerPhotoUrl?: string };

// Must match CRITERIA order exactly — maps criterion index → DB field name
const SCORE_KEYS: (keyof Assessment)[] = [
  'scorePreClass',           // preClass
  'scoreClientConnection',   // verbalCues
  'scoreMapping',            // visualDemos
  'scoreInjuryModifications',
  'scoreLevelModifications',
  'scoreUspIntegration',     // uspIntegration
  'scoreMusicalArc',         // musicChoices
  'scoreCoachingDelivery',   // spaceManagement
  'scoreTimeManagement',
  'scoreUseOfNames',
  'scoreMotivation',         // overallEnergy
  'scoreMindfulMoment',
  'scorePostClass',
];

const inkStyle = { color: 'hsl(var(--ink))' };

function InkValue({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold" style={inkStyle}>{children}</span>;
}

const BAND_ICON: Record<string, string> = {
  Exceptional: '🏆', Good: '✅', Average: '📊', Poor: '⚠️', 'Needs Help': '🔴',
};

export default function ReportDoc({ a, trainerPhotoUrl }: Props) {
  const band = getBand(a.totalScore);
  const formattedDate = a.classDate ? format(new Date(a.classDate), 'dd/MM/yyyy, hh:mm a') : '—';
  const submittedDate = a.submittedAt ? format(new Date(a.submittedAt), 'dd MMM yyyy') : '—';
  const initials = getInitials(a.trainerName ?? '');
  const avatarColor = getAvatarColor(a.trainerName ?? '');

  return (
    <div id="report" className="bg-white text-gray-900 max-w-3xl mx-auto shadow-2xl print:shadow-none text-[13px]">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b-2 border-gray-100">
        <div className="flex items-center gap-6">
          {/* Trainer photo */}
          <div className="flex-shrink-0">
            {trainerPhotoUrl ? (
              <img src={trainerPhotoUrl} alt={a.trainerName} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-xl ${avatarColor}`}>
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 text-center">
            <div className="text-3xl font-black tracking-tight text-gray-900">PHYSIQUE<span style={inkStyle}>57</span></div>
            <h1 className="text-xl font-bold mt-1 text-gray-800">Training Quality Assessment</h1>
            <p className="text-xs tracking-[0.2em] text-gray-400 mt-1 uppercase">Performance Review &amp; Feedback</p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="text-4xl font-black" style={inkStyle}>{a.totalScore.toFixed(0)}</div>
            <div className="text-xs text-gray-400 font-medium">out of 100</div>
            <div className={`text-xs font-bold mt-0.5 px-2 py-0.5 rounded-full inline-block ${band.bgClass} ${band.colorClass}`}>{band.label}</div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-7">
        {/* Class Details */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={inkStyle} />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Session Details</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: 'INSTRUCTOR', value: a.trainerName },
              { label: 'DATE & TIME', value: formattedDate },
              { label: 'SESSION TYPE', value: a.sessionName },
              { label: 'STUDIO / CENTRE', value: a.location },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-0.5">{label}</div>
                <div className="text-base border-b border-gray-200 pb-1"><InkValue>{value}</InkValue></div>
              </div>
            ))}
            <div className="col-span-2">
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-0.5">EVALUATED BY</div>
              <div className="text-base border-b border-gray-200 pb-1"><InkValue>{a.evaluatorName}</InkValue></div>
            </div>
          </div>
        </section>

        {/* Criteria Table */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={inkStyle} />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Evaluation Criteria</h2>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[9px] uppercase tracking-[0.15em] text-gray-500">
                <th className="text-left p-2.5 border border-gray-200 font-bold">Criterion</th>
                <th className="text-right p-2.5 border border-gray-200 font-bold w-20">Max</th>
                <th className="text-right p-2.5 border border-gray-200 font-bold w-20">Score</th>
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((c, i) => {
                const score = (a[SCORE_KEYS[i]] as number) ?? 0;
                return (
                  <tr key={c.id} className="border-b border-gray-100">
                    <td className="p-2.5 border border-gray-200 text-sm text-gray-700">{c.label}</td>
                    <td className="p-2.5 border border-gray-200 text-right text-sm text-gray-400">{c.maxPts}</td>
                    <td className="p-2.5 border border-gray-200 text-right">
                      <span className="inline-block font-black text-sm px-2.5 py-0.5 rounded-lg min-w-[2rem] text-center border-2"
                        style={{ ...inkStyle, borderColor: 'hsl(var(--ink) / 0.3)', background: 'hsl(var(--ink) / 0.06)' }}>
                        {score}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50">
                <td className="p-2.5 border border-gray-200 text-sm font-bold uppercase tracking-wide text-gray-700">Total Score</td>
                <td className="p-2.5 border border-gray-200 text-right text-sm font-bold text-gray-700">100</td>
                <td className="p-2.5 border border-gray-200 text-right">
                  <span className="inline-block font-black text-base px-2.5 py-0.5 rounded-lg min-w-[2rem] text-center text-white"
                    style={{ background: 'hsl(var(--ink))' }}>
                    {a.totalScore.toFixed(0)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Performance Band */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={inkStyle} />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Performance Band</h2>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {PERFORMANCE_BANDS.map(b => {
              const active = b.label === band.label;
              return (
                <div key={b.label} className={`border-2 rounded-xl p-2.5 text-center ${active ? `${band.bgClass} border-current` : 'border-gray-200 bg-gray-50'}`}>
                  {active && <div className="text-sm mb-0.5">{BAND_ICON[b.label] ?? '●'}</div>}
                  <div className={`text-[9px] font-bold uppercase tracking-wide ${active ? band.colorClass : 'text-gray-400'}`}>{b.label}</div>
                  <div className={`text-[8px] mt-0.5 ${active ? 'text-gray-600' : 'text-gray-300'}`}>{b.range}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Qualitative Feedback */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={inkStyle} />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Qualitative Feedback</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'KEY STRENGTHS OBSERVED', value: a.keyStrengths },
              { label: 'AREAS FOR IMPROVEMENT', value: a.areasForImprovement },
              { label: 'COACHING ACTION PLAN', value: a.coachingActionPlan },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5">{label}</div>
                <div className="border border-gray-200 rounded-lg p-3 min-h-[60px] text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {value || <span className="text-gray-300 italic">—</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Signature */}
        <section className="border-t border-gray-200 pt-5">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">EVALUATOR SIGNATURE</div>
              <div className="border-b border-gray-300 pb-1"
                style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.5rem', fontWeight: 700, ...inkStyle }}>
                {a.evaluatorName}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">DATE OF SUBMISSION</div>
              <div className="border-b border-gray-300 pb-1 text-base font-semibold" style={inkStyle}>{submittedDate}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
