export const LOCATIONS = [
  'Kwality House, Kemps Corner',
  'Supreme HQ, Bandra',
  //'Kenkere House',
  //'South United Football Club',
  //'The Studio by Copper + Cloves',
  //'WeWork Galaxy',
  //'WeWork Prestige Central',
  //'Pop-up',
] as const;

export type LocationType = typeof LOCATIONS[number];

export const SESSION_NAMES = [
  'Strength Lab - Full Body',
  'Strength Lab - Pull',
  'Strength Lab - Push',
  'Strength Lab - Practice Session',
] as const;

const KENKERE_LOCATIONS = ['Kenkere House', 'The Studio by Copper + Cloves', 'Pop-up'];

export const KENKERE_TRAINERS = [
  'Pushyank Nahar', 'Kajol Kanchan', 'Siddhartha Kusuma', 'Shruti Kulkarni', 'Chaitanya Nahar',
];

export const OTHER_EMPLOYEES = [
  'Akshay Rane','Deesha Changwani','Imran Shaikh','Jimmeey Gondaa','Mallika Parekh','Mitali Kumar',
  'Nadiya Shaikh','Nunu Anu','Physique 57 India','Prathap Kp','Reyna Jagtiani','Saachi Shetty',
  'Sheetal Kataria','Shifa Ali','Shipra Bhika','Tahira Shaikh','Vahishta Fitter','Wungsingla Serou',
  'Zahur Shaikh','Zaheer Agarbattiwala',
];

export const OTHER_TRAINERS = [
  'Anisha Shah', 'Atulan Purohit','Anmol Sharma', 'Karanvir Bhatia', 'Mrigakshi Jaiswal',
  'Pranjali Jain', 'Reshma Sharma', "Richard D'Costa", 'Rohan Dahima',
  'Karan Bhatia', 'Vivaran Dhasmana', 'Cauveri Vikrant',
  'Simonelle De Vitre', 'Simran Dutt', 'Bret Saldanha',
  'Raunak Khemuka',
];

export const ALL_PEOPLE = Array.from(new Set([...KENKERE_TRAINERS, ...OTHER_TRAINERS, ...OTHER_EMPLOYEES])).sort();

export const EVALUATORS = [
  'Akshay Rane', 'Anisha Shah', 'Anmol Sharma','Atulan Purohit', 'Cauveri Vikrant', 'Deesha Changwani',
  'Imran Shaikh', 'Jimmeey Gondaa', 'Kajol Kanchan', 'Karan Bhatia', 'Karanvir Bhatia',
  'Mallika Parekh', 'Manisha Rathod', 'Mitali Kumar', 'Mrigakshi Jaiswal', 'Nadiya Shaikh',
  'Nishanth Raj', 'Nunu Anu', 'Physique 57 India', 'Pranjali Jain', 'Prathap Kp',
  'Pushyank Nahar', "Richard D'souza", 'Reyna Jagtiani', 'Rohan Dahima', 'Saachi Shetty',
  'Sheetal Kataria', 'Shifa Ali', 'Shipra Bhika', 'Shruti K', 'Shruti S', 'Tahira Shaikh',
  'Vahishta Fitter', 'Vivaran Dhasmana', 'Wungsingla Serou', 'Zahur Shaikh', 'Zaheer Agarbattiwala',
].sort();

export function getTrainersForLocation(location: string): string[] {
  return KENKERE_LOCATIONS.includes(location) ? KENKERE_TRAINERS : OTHER_TRAINERS;
}

export function getGroupForLocation(location: string): 'Kenkere' | 'Other' {
  return KENKERE_LOCATIONS.includes(location) ? 'Kenkere' : 'Other';
}

export const TO_EMAIL = 'anisha@physique57india.com';
export const CC_EMAIL = ['atulan@physique57mumbai.com', 'vivaran@physique57mumbai.com', 'mrigakshi@physique57mumbai.com'];
export const BCC_EMAIL = 'jimmeey@physique57india.com';

// DB field → criteria ID mapping (existing columns repurposed for new criteria)
export const SCORE_FIELD_MAP: Record<string, string> = {
  preClass:            'scorePreClass',
  verbalCues:          'scoreClientConnection',
  visualDemos:         'scoreMapping',
  injuryModifications: 'scoreInjuryModifications',
  levelModifications:  'scoreLevelModifications',
  uspIntegration:      'scoreUspIntegration',
  musicChoices:        'scoreMusicalArc',
  spaceManagement:     'scoreCoachingDelivery',
  timeManagement:      'scoreTimeManagement',
  useOfNames:          'scoreUseOfNames',
  overallEnergy:       'scoreMotivation',
  mindfulMoment:       'scoreMindfulMoment',
  postClass:           'scorePostClass',
};

export const CRITERIA = [
  {
    id: 'preClass',
    label: 'Pre-Class Setup',
    maxPts: 5,
    description: 'Room presentation, vibe, pre-class chat, and room organisation before the session begins',
    subPoints: ['Room set up and clean before clients arrive', 'Equipment organised and accessible', 'Music playing and vibe established on entry', 'Warm and welcoming pre-class client interaction'],
    quickNotes: ['Room was well set up and ready', 'Great pre-class energy and vibe', 'Equipment was organised and accessible', 'Welcoming music was playing on entry', 'Pre-class client interaction was warm and genuine', 'Room setup could be improved next time'],
  },
  {
    id: 'verbalCues',
    label: 'Verbal Cues',
    maxPts: 7.5,
    description: 'Quality, clarity, and effectiveness of verbal coaching cues delivered during the session',
    subPoints: ['Clear and concise cueing language throughout', 'Cues are well-timed and contextually relevant', 'Language is accessible and inclusive for all levels', 'Variety in cueing style and approach'],
    quickNotes: ['Verbal cues were clear and well-timed', 'Great variety in coaching language used', 'Cues were accessible to all fitness levels', 'Coaching language was precise and effective', 'More cue variety would enhance the experience', 'Timing of verbal cues could be improved'],
  },
  {
    id: 'visualDemos',
    label: 'Visual Demonstrations',
    maxPts: 7.5,
    description: 'Clarity, timing, and effectiveness of visual demonstrations provided during the session',
    subPoints: ['Demonstrations are clear and easy to follow', 'Positioned well for the whole class to see', 'Demos given at the right moment in each segment', 'Both correct form and modifications are demonstrated'],
    quickNotes: ['Demonstrations were clear and easy to follow', 'Great positioning for class-wide visibility', 'Demos were well-timed and highly relevant', 'Both correct form and modifications were shown', 'More demonstrations would benefit all clients', 'Positioning during demos could be improved'],
  },
  {
    id: 'injuryModifications',
    label: 'Injury Modifications',
    maxPts: 7.5,
    description: 'Identifying clients with injuries and providing safe, appropriate movement modifications',
    subPoints: ['Proactively checks for injuries before class begins', 'Offers safe and appropriate movement alternatives', 'Monitors injured clients consistently throughout class', 'Modifications are communicated clearly and confidently'],
    quickNotes: ['Injuries were proactively identified and acknowledged', 'Safe and appropriate modifications were offered', 'Injured clients were monitored throughout class', 'Modifications were communicated clearly', 'More proactive injury check-in recommended', 'Injury modifications could be more specific'],
  },
  {
    id: 'levelModifications',
    label: 'Level-Appropriate Personal Modifications',
    maxPts: 7.5,
    description: 'Adapting exercises to suit individual client levels and abilities across the entire class',
    subPoints: ['Identifies varying ability levels in the room', 'Offers progressions to challenge advanced clients', 'Offers regressions to support beginners', 'Modifications feel inclusive and naturally delivered'],
    quickNotes: ['Great range of progressions and regressions offered', 'All levels felt included and well catered to', 'Advanced clients were challenged appropriately', 'Beginners were guided with clear regressions', 'More level-appropriate cueing would be beneficial', 'Modifications were inclusive and well-delivered'],
  },
  {
    id: 'uspIntegration',
    label: 'USP Integration, Motivation & Connection',
    maxPts: 10,
    description: 'Integration of Physique 57 brand USP, motivational language, and authentic client connection',
    subPoints: ['Physique 57 brand messaging and USP integrated naturally', 'Motivational language that genuinely inspires clients', 'Authentic and meaningful client connection throughout', 'Energy elevates the overall session experience'],
    quickNotes: ['Brand USP was naturally and effectively integrated', 'Motivational language was powerful and authentic', 'Strong and genuine client connection was evident', 'Physique 57 DNA was clearly present throughout', 'Brand messaging could be integrated more naturally', 'More authentic connection with clients is recommended'],
  },
  {
    id: 'musicChoices',
    label: 'Music Choices',
    maxPts: 10,
    description: 'Appropriateness, energy arc, and overall quality of music selection for the session type',
    subPoints: ['Music matches the energy of each segment', 'Playlist arc builds and releases effectively', 'Genre and tempo are appropriate for the class type', 'Music enhances and elevates the overall experience'],
    quickNotes: ['Music was perfectly matched to the session', 'Playlist arc built and released beautifully', 'Tempo and genre choices were excellent throughout', 'Music elevated the overall session energy', 'Playlist flow could be more intentional', 'Some music choices felt disconnected from the session'],
  },
  {
    id: 'spaceManagement',
    label: 'Space Management',
    maxPts: 10,
    description: 'Effective use and organisation of studio space and equipment throughout the session',
    subPoints: ['Moves confidently and intentionally throughout the studio', 'Equipment and props are positioned thoughtfully', 'All clients have adequate space to move safely', 'Full room space is utilised effectively'],
    quickNotes: ['Space was used confidently and effectively', 'Equipment placement was thoughtful and well-organised', 'All clients had ample space to move freely', 'Full studio space was utilised well throughout', 'More intentional movement around the studio is recommended', 'Equipment organisation could be improved'],
  },
  {
    id: 'timeManagement',
    label: 'Time Management',
    maxPts: 10,
    description: 'Session pacing, timing adherence, and structural flow throughout the class',
    subPoints: ['Class starts and ends on time', 'Each section is timed appropriately', 'Smooth and intentional transitions between segments', 'Overall pacing feels deliberate and well-structured'],
    quickNotes: ['Class ran precisely to schedule', 'Section pacing was excellent throughout', 'Transitions between segments were smooth', 'Strong overall timing and structural discipline', 'Some sections ran slightly over the allotted time', 'Pacing could be more consistent throughout'],
  },
  {
    id: 'useOfNames',
    label: 'Use of Names',
    maxPts: 7.5,
    description: 'Using client names consistently to personalise the experience and build authentic connection',
    subPoints: ['Learns and uses client names throughout the class', 'Acknowledges both regulars and new clients by name', 'Names are used in a natural and personal way', 'Creates a truly personalised experience for each client'],
    quickNotes: ['Client names were used consistently and naturally', 'Regulars and newcomers were acknowledged personally', 'Name use created a warm and personal atmosphere', 'Great personalisation through consistent name usage', 'More consistent use of client names is recommended', 'Learning new client names earlier would enhance connection'],
  },
  {
    id: 'overallEnergy',
    label: 'Overall Energy',
    maxPts: 7.5,
    description: 'Energy levels, enthusiasm, and ability to inspire and uplift clients throughout the entire session',
    subPoints: ['Consistent and authentic energy sustained throughout', 'Energy peaks match the intensity of the session', 'Enthusiasm is genuinely contagious and inspires clients', 'Overall energy maintains client engagement and drive'],
    quickNotes: ['Energy was high and sustained throughout the class', 'Enthusiasm was genuinely contagious', 'Clients were visibly energised and inspired', 'Energy peaked effectively at the right moments', 'Energy consistency could be improved', 'More dynamic energy shifts would elevate the class'],
  },
  {
    id: 'mindfulMoment',
    label: 'Mindful Moment (Entry + Exit)',
    maxPts: 5,
    description: 'Quality and delivery of the mindful moment at both class entry and exit',
    subPoints: ['Opening mindful moment sets a powerful and intentional tone', 'Closing mindful moment provides meaningful closure', 'Delivery is calm, intentional, and authentic throughout', 'Mindful moment connects meaningfully to the session theme'],
    quickNotes: ['Mindful moments were beautifully and authentically delivered', 'Opening moment set a powerful tone for the class', 'Closing moment provided meaningful and lasting impact', 'Delivery was calm, intentional, and genuine', 'Closing mindful moment could be more thoughtful', 'More intention behind the mindful moment is recommended'],
  },
  {
    id: 'postClass',
    label: 'Post-Class Spiel',
    maxPts: 5,
    description: 'Post-class communication, new client onboarding, schedule and class promotion, and overall farewell vibe',
    subPoints: ['Engages warmly and genuinely with clients after class', 'New client spiel is delivered confidently and clearly', 'Own schedule and P57 classes are promoted effectively', 'Positive, memorable, and uplifting farewell energy'],
    quickNotes: ['Post-class engagement was warm and genuine', 'New client spiel was delivered confidently', 'Schedule and P57 classes were promoted effectively', 'Farewell energy was memorable and uplifting', 'New client onboarding spiel could be stronger', 'More proactive post-class client engagement is recommended'],
  },
] as const;

export type CriterionId = typeof CRITERIA[number]['id'];

export const COACHING_QUICK_OPTIONS = [
  'Focus on using client names consistently throughout class',
  'Work on vocal range — incorporate more dynamic and varied cues',
  'Improve room scanning — be more aware of all clients at all times',
  'Refine Physique 57 brand and mindful moment delivery',
  'Strengthen motivational language and peak energy moments',
  'Better time management for each section and segment',
  'Add more specific cue variations for beginners and advanced clients',
  'Develop stronger post-class client connection and conversation',
  'Work on proactively identifying and modifying for injuries',
];

export const STRENGTHS_QUICK_OPTIONS = [
  'Strong energy and commanding presence throughout',
  'Excellent and consistent client connection',
  'Powerful and varied motivational language',
  'Great music choices and session flow',
  'Natural and authentic brand integration',
  'Precise, clear, and effective coaching cues',
];

export const IMPROVEMENT_QUICK_OPTIONS = [
  'Vocal variation — needs more dynamic range in cues',
  'More room scanning — less self-focus',
  'Time management across sections needs tightening',
  'Brand language integration into coaching could be stronger',
  'Modification cueing for different levels needs more variety',
  'Post-class client engagement and connection needs development',
];

export const PERFORMANCE_BANDS = [
  { label: 'Exceptional', range: '90 – 100', min: 90, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 border-emerald-200' },
  { label: 'Good',        range: '80 – 89',  min: 80, colorClass: 'text-blue-600',    bgClass: 'bg-blue-50 border-blue-200' },
  { label: 'Average',     range: '70 – 79',  min: 70, colorClass: 'text-amber-600',   bgClass: 'bg-amber-50 border-amber-200' },
  { label: 'Poor',        range: '60 – 69',  min: 60, colorClass: 'text-orange-600',  bgClass: 'bg-orange-50 border-orange-200' },
  { label: 'Needs Help',  range: '< 60',     min: 0,  colorClass: 'text-rose-600',    bgClass: 'bg-rose-50 border-rose-200' },
] as const;

export function getBand(score: number) {
  return [...PERFORMANCE_BANDS].find(b => score >= b.min) ?? PERFORMANCE_BANDS[PERFORMANCE_BANDS.length - 1];
}

const AVATAR_COLORS = ['bg-violet-500','bg-rose-500','bg-orange-500','bg-amber-500','bg-emerald-500','bg-teal-500','bg-cyan-500','bg-blue-500','bg-indigo-500','bg-pink-500'];
export function getAvatarColor(name: string): string {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export const ADMIN_CODE = '9818';
