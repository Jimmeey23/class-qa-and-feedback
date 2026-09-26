export type Attachment = { url: string; name: string; type: 'image' | 'file' | 'voice' };
export type SectionData = { notes: string; attachments: Attachment[] };

export type FormState = {
  trainerName: string;
  evaluatorName: string;
  location: string;
  sessionName: string;
  classDate: string;
  scores: Record<string, number>;
  sections: Record<string, SectionData>;
  strengths: string;
  areasForImprovement: string;
  coachingActionPlan: string;
};

export const emptySection = (): SectionData => ({ notes: '', attachments: [] });

export const initialFormState = (): FormState => ({
  trainerName: '',
  evaluatorName: '',
  location: '',
  sessionName: '',
  classDate: '',
  scores: {},
  sections: {},
  strengths: '',
  areasForImprovement: '',
  coachingActionPlan: '',
});
