import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssessment, getTrainers, GetAssessmentOutputType } from '@/api/client';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { ArrowLeft, Printer, CheckCircle2 } from 'lucide-react';
import ReportDoc from '../components/ReportDoc';
import { toast } from 'sonner';

type Assessment = NonNullable<GetAssessmentOutputType['assessment']>;

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [trainerPhotoUrl, setTrainerPhotoUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAssessment({ id }).then(({ assessment: a }) => {
      setAssessment(a);
      setLoading(false);
      if (a?.trainerName) {
        getTrainers({}).then(({ trainers }) => {
          const match = trainers.find(t => t.name === a.trainerName);
          if (match?.photoUrl) setTrainerPhotoUrl(match.photoUrl);
        }).catch(() => {});
      }
    }).catch(() => { toast.error('Report not found'); setLoading(false); });
  }, [id]);

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4">
      <div className="no-print max-w-3xl mx-auto mb-6 flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" className="gap-2" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          {!loading && assessment && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Report saved &amp; email sent
            </span>
          )}
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : assessment ? (
        <ReportDoc a={assessment} trainerPhotoUrl={trainerPhotoUrl} />
      ) : (
        <div className="max-w-3xl mx-auto text-center py-20 text-muted-foreground">
          Report not found. <Button variant="link" onClick={() => navigate('/')}>Return</Button>
        </div>
      )}
    </div>
  );
}
