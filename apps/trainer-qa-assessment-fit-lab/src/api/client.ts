const FORM_TYPE = 'fit_lab';
const base = `/api/${FORM_TYPE}`;
async function request<T>(url: string, init?: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { 'content-type': 'application/json', ...init?.headers } }); if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || `Request failed (${response.status})`); return response.json(); }
export type Trainer = { id: string; name: string; studioGroup: string; photoUrl?: string; active: boolean };
export type Assessment = { id: string; trainerName: string; evaluatorName: string; location: string; sessionName: string; classDate: string; scorePreClass: number; scoreClientConnection: number; scoreUspIntegration: number; scoreMapping: number; scoreMusicalArc: number; scoreCoachingDelivery: number; scoreMotivation: number; scoreTimeManagement: number; scorePostClass: number; scoreInjuryModifications: number; scoreLevelModifications: number; scoreUseOfNames: number; scoreMindfulMoment: number; totalScore: number; performanceBand: string; keyStrengths: string; areasForImprovement: string; coachingActionPlan: string; sectionNotes: string; submittedAt: string };
export type GetTrainersOutputType = { trainers: Trainer[] };
export type GetAssessmentsOutputType = { assessments: Assessment[] };
export type GetAssessmentOutputType = { assessment: Assessment | null };
export const getTrainers = (_input: object) => request<GetTrainersOutputType>(`${base}/trainers`);
export const createTrainer = (input: any) => request<{ success: boolean; id: string }>(`${base}/trainers`, { method: 'POST', body: JSON.stringify(input) });
export const updateTrainer = ({ id, ...input }: any) => request<{ success: boolean }>(`${base}/trainers/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const deleteTrainer = ({ id }: { id: string }) => request<{ success: boolean }>(`${base}/trainers/${id}`, { method: 'DELETE' });
export const getAssessments = (input: any) => { const q = new URLSearchParams(Object.entries(input || {}).filter(([,v]) => v).map(([k,v]) => [k, String(v)])); return request<GetAssessmentsOutputType>(`${base}/assessments?${q}`); };
export const getAssessment = ({ id }: { id: string }) => request<GetAssessmentOutputType>(`${base}/assessments/${id}`);
export const submitAssessment = (input: any) => request<{ success: boolean; id: string; emailSent?: boolean }>(`${base}/assessments`, { method: 'POST', body: JSON.stringify(input) });
export const updateAssessment = ({ id, ...input }: any) => request<{ success: boolean }>(`${base}/assessments/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const deleteAssessment = ({ id }: { id: string }) => request<{ success: boolean }>(`${base}/assessments/${id}`, { method: 'DELETE' });
export const getSettings = (_input: object) => request<any>(`${base}/settings`);
export const saveSettings = ({ key, value }: { key: string; value: string }) => request<{ success: boolean }>(`${base}/settings/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify({ value }) });
