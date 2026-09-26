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

export const SESSION_NAMES = ['Studio powerCycle', 'Studio powerCycle Express', 'Practice Class'] as const;

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
  'Anisha Shah', 'Atulan Purohit', 'Karanvir Bhatia', 'Mrigakshi Jaiswal',
  'Pranjali Jain', 'Reshma Sharma', "Richard D'Costa", 'Rohan Dahima',
  'Karan Bhatia', 'Vivaran Dhasmana', 'Cauveri Vikrant',
  'Simonelle De Vitre', 'Simran Dutt', 'Anmol Sharma', 'Bret Saldanha',
  'Raunak Khemuka',
];

export const ALL_PEOPLE = Array.from(new Set([...KENKERE_TRAINERS, ...OTHER_TRAINERS, ...OTHER_EMPLOYEES])).sort();

// Full evaluator list for the "Evaluated By" dropdown
export const EVALUATORS = [
  'Akshay Rane', 'Anisha Shah', 'Atulan Purohit', 'Anmol Sharma','Cauveri Vikrant', 'Deesha Changwani',
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

export const CRITERIA = [
  {
    id: 'preClass', label: 'Pre Class Setup & Vibe', maxPts: 5,
    description: 'Energy, setup, and atmosphere created before class begins',
    subPoints: ['Music playing on entry', 'Warm welcome and presence', 'Room set and ready', 'Trainer energy level'],
    quickNotes: ['Energy was high pre-class', 'Music was ready and welcoming', 'Room was well set up', 'Warm and enthusiastic welcome given', 'Setup could be improved next time', 'Great pre-class client interaction'],
  },
  {
    id: 'clientConnection', label: 'Client Connection', maxPts: 20,
    description: 'Fun factor, empathy, names, and 1-on-1 coaching moments',
    subPoints: ['Uses names and acknowledges regulars', 'Gives options (beginner vs advanced) without judgment', 'Scans the room — not stuck in mirror', 'Reads energy and adjusts tone', 'Micro-moments: eye contact, nods, encouragement'],
    quickNotes: ['Great use of client names throughout', 'Strong room-scanning and awareness', 'Excellent beginner modifications offered', 'Impactful 1-on-1 coaching moments', 'Clients were visibly engaged and connected', 'More personalised interaction needed'],
  },
  {
    id: 'uspIntegration', label: 'USP Integration + Scientific Rhetoric', maxPts: 10,
    description: 'Brand USP integration and scientific coaching language',
    subPoints: ['Mindful moment and brand language', 'Scientific cues and rationale', 'Physique 57 brand messaging', 'Authenticity in delivery'],
    quickNotes: ['Mindful moment was powerful and on-brand', 'Brand language used effectively', 'Scientific cues were clear and convincing', 'Physique 57 DNA was clearly evident', 'Brand integration felt natural and authentic', 'Brand messaging could be stronger'],
  },
  {
    id: 'mapping', label: 'Mapping + Learning Styles', maxPts: 10,
    description: 'Imagery, auditory cues, and self-riding posture coaching',
    subPoints: ['Visual imagery and metaphors', 'Auditory coaching cues', 'Self-posture coaching', 'Modification offerings for all levels'],
    quickNotes: ['Strong and vivid visual imagery used', 'Auditory cues were varied and effective', 'Clear posture coaching throughout', 'Good range of modification cues offered', 'Imagery could be more varied and creative'],
  },
  {
    id: 'musicalArc', label: 'Musical Arc & Playlist Programming', maxPts: 15,
    description: 'Music selection, programming flow, and transitions',
    subPoints: ['Build and release arc', 'Music matches movement', 'Playlist energy arc', 'Smooth transitions'],
    quickNotes: ['Playlist arc was expertly crafted', 'Music perfectly matched movement', 'Strong build and release moments', 'Transitions between tracks were seamless', 'Playlist energy could flow better', 'Music selection was inspiring'],
  },
  {
    id: 'coachingDelivery', label: 'Coaching Delivery / Voice', maxPts: 15,
    description: 'Ebbs, flows, and coaching presence on stage',
    subPoints: ['Voice projection and clarity', 'Ebbs and flows in delivery', 'Stage presence and movement', 'Coaching through the movement'],
    quickNotes: ['Strong and commanding stage presence', 'Voice projection was excellent', 'Great vocal ebbs and flows throughout', 'Moved confidently across the stage', 'Coaching language was precise and motivating', 'Voice needs more dynamic variation'],
  },
  {
    id: 'motivation', label: 'Motivation + Inspiration', maxPts: 15,
    description: 'Energy, enthusiasm, and inspiring clients to push their limits',
    subPoints: ['Motivational language', 'Energy peaks and valleys', 'Emotional connection with class', 'Inspiring breakthrough moments'],
    quickNotes: ['High energy sustained throughout class', 'Motivational language was powerful', 'Clients visibly pushed harder', 'Strong emotional connection with the room', 'Inspirational peak moments created', 'Energy could be more consistent'],
  },
  {
    id: 'timeManagement', label: 'Time Management', maxPts: 5,
    description: 'Session pacing, structure, and timing control throughout',
    subPoints: ['Class starts on time', 'Section timing adherence', 'Cool-down timing', 'Overall pacing'],
    quickNotes: ['Class ran precisely to time', 'Section pacing was excellent', 'Cool-down was well-timed', 'Smooth transitions between sections', 'Some sections ran slightly over', 'Strong overall timing discipline'],
  },
  {
    id: 'postClass', label: 'Post Class Messaging & Vibe', maxPts: 5,
    description: 'Cool-down quality, messaging, and client engagement after class',
    subPoints: ['Cool-down quality', 'Closing message resonance', 'Warm client goodbye', 'Post-class energy maintained'],
    quickNotes: ['Warm and energetic send-off to clients', 'Closing message was inspiring and memorable', 'Strong post-class client connection', 'Great retention and feedback conversation', 'Energy was maintained post-class', 'Post-class engagement could be stronger'],
  },
] as const;

export type CriterionId = typeof CRITERIA[number]['id'];

export const COACHING_QUICK_OPTIONS = [
  'Focus on using client names consistently throughout class',
  'Work on vocal range — incorporate more dynamic ebbs and flows',
  'Practice playlist programming and musical arc structure',
  'Improve room scanning — reduce time in mirror or self-focus',
  'Refine Physique 57 brand and mindful moment delivery',
  'Strengthen motivational language and peak energy moments',
  'Better time management for each section and segment',
  'Add more specific cue variations for beginners and advanced clients',
  'Develop stronger post-class client connection and conversation',
];

export const STRENGTHS_QUICK_OPTIONS = [
  'Strong energy and commanding stage presence',
  'Excellent client connection and warmth',
  'Powerful and varied motivational language',
  'Great musical programming and arc',
  'Natural and authentic brand integration',
  'Precise and effective coaching delivery',
];

export const IMPROVEMENT_QUICK_OPTIONS = [
  'Vocal variation — needs more ebbs and flows',
  'More room scanning — less self-focus',
  'Time management across sections',
  'Brand language integration into coaching',
  'Modification cueing for different levels',
  'Post-class client engagement and connection',
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
