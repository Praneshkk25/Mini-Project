// Dashboard Home Page — Mock Data
// Matches the AuraHealth reference design sections

export const DASHBOARD_STATS = {
  totalPatients: { value: '14,208', trend: '+12.5%', trendUp: true },
  todayAppointments: { value: '42', pending: 8 },
  bedOccupancy: { value: '82%', tag: 'ICU Full' },
  monthlyRevenue: { value: '$482,350', trend: '+8.2%', trendUp: true },
};

export const UPCOMING_APPOINTMENTS = [
  {
    id: 1,
    initials: 'MV',
    name: 'Marcus Vance',
    time: '09:00 AM - 09:30 AM',
    type: 'Cardiology Consultation',
    status: 'Checked In',
  },
  {
    id: 2,
    initials: 'ER',
    name: 'Elena Rostova',
    time: '09:45 AM - 10:45 AM',
    type: 'Neurology MRI Scan',
    status: 'In Progress',
  },
  {
    id: 3,
    initials: 'DO',
    name: "David O'Connor",
    time: '10:30 AM - 11:00 AM',
    type: 'Orthopedics Follow-up',
    status: 'Waiting',
  },
  {
    id: 4,
    initials: 'AR',
    name: 'Aisha Rahman',
    time: '11:15 AM - 12:30 PM',
    type: 'Oncology Chemotherapy',
    status: 'Confirmed',
  },
  {
    id: 5,
    initials: 'LG',
    name: 'Liam Gallagher',
    time: '01:00 PM - 01:30 PM',
    type: 'General Check-up',
    status: 'Scheduled',
  },
];

export const WARD_OCCUPANCY = [
  { name: 'ICU', value: 90, color: '#ef4444' },
  { name: 'General Ward', value: 75, color: '#0d9488' },
  { name: 'Pediatrics', value: 60, color: '#3b82f6' },
  { name: 'Maternity', value: 85, color: '#a855f7' },
];

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    time: '08:45 AM',
    text: 'Lab results uploaded for patient #4992 by Dr. Adams.',
    color: '#10b981',
  },
  {
    id: 2,
    time: '09:10 AM',
    text: 'Pharmacy dispensed medication for Room 304.',
    color: '#3b82f6',
  },
  {
    id: 3,
    time: '09:30 AM',
    text: 'Dr. Aris Thalia joined the surgery in OR 2.',
    color: '#22c55e',
  },
  {
    id: 4,
    time: '10:05 AM',
    text: 'Insurance claim approved for Case #8831.',
    color: '#f59e0b',
  },
];

export const TOP_MEDICATIONS = [
  { name: 'Amoxicillin 500mg', units: 1240, maxUnits: 1240 },
  { name: 'Lisinopril 10mg', units: 980, maxUnits: 1240 },
  { name: 'Metformin 850mg', units: 850, maxUnits: 1240 },
  { name: 'Omeprazole 20mg', units: 720, maxUnits: 1240 },
];

// Sparkline data for stat cards
export const PATIENTS_SPARKLINE = [
  { v: 12000 }, { v: 12200 }, { v: 12500 }, { v: 12800 },
  { v: 13100 }, { v: 13400 }, { v: 13600 }, { v: 13900 },
  { v: 14000 }, { v: 14208 },
];

export const REVENUE_SPARKLINE = [
  { v: 35 }, { v: 42 }, { v: 38 }, { v: 45 }, { v: 40 },
  { v: 48 }, { v: 44 }, { v: 50 }, { v: 46 }, { v: 52 },
  { v: 48 }, { v: 55 },
];
