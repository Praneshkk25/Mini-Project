// Centralized Mock Data Store for AI Hospital & Discharge Assistance

export const MOCK_PATIENTS_QUEUE = [
  { id: 'P-101', name: 'Ramesh Kumar', age: 45, gender: 'Male', token: 'A-012', department: 'General Medicine', doctor: 'Dr. Sarah Smith', status: 'In Consultation', waitTime: '12 mins', history: ['Hypertension (2021)', 'Appendectomy (2018)'] },
  { id: 'P-102', name: 'Priya Sharma', age: 32, gender: 'Female', token: 'A-013', department: 'Cardiology', doctor: 'Dr. Vikas Rao', status: 'Waiting', waitTime: '18 mins', history: ['Mild Asthma', 'Allergy: Penicillin'] },
  { id: 'P-103', name: 'Anish Verma', age: 58, gender: 'Male', token: 'A-014', department: 'Orthopedics', doctor: 'Dr. Anita Roy', status: 'Waiting', waitTime: '25 mins', history: ['Osteoarthritis Right Knee'] },
  { id: 'P-104', name: 'Sunita Devi', age: 67, gender: 'Female', token: 'A-015', department: 'General Medicine', doctor: 'Dr. Sarah Smith', status: 'Waiting', waitTime: '32 mins', history: ['Type 2 Diabetes', 'Hypertension'] },
  { id: 'P-105', name: 'Karthik Raja', age: 29, gender: 'Male', token: 'A-016', department: 'Pediatrics', doctor: 'Dr. M. Patel', status: 'Completed', waitTime: '0 mins', history: ['Acute Bronchitis'] },
];

export const MOCK_BEDS = [
  { id: 'B-101', ward: 'ICU Block A', bedNo: 'ICU-01', status: 'occupied', patientName: 'Vikram Mehta', age: 62, gender: 'Male', admittedOn: '2026-07-28', doctor: 'Dr. Sarah Smith' },
  { id: 'B-102', ward: 'ICU Block A', bedNo: 'ICU-02', status: 'available', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-103', ward: 'ICU Block A', bedNo: 'ICU-03', status: 'occupied', patientName: 'Deepa Menon', age: 49, gender: 'Female', admittedOn: '2026-07-29', doctor: 'Dr. Vikas Rao' },
  { id: 'B-104', ward: 'General Male', bedNo: 'GM-101', status: 'available', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-105', ward: 'General Male', bedNo: 'GM-102', status: 'occupied', patientName: 'Amit Shah', age: 53, gender: 'Male', admittedOn: '2026-07-30', doctor: 'Dr. Anita Roy' },
  { id: 'B-106', ward: 'General Male', bedNo: 'GM-103', status: 'cleaning', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-107', ward: 'General Female', bedNo: 'GF-201', status: 'reserved', patientName: 'Meena Kumari', age: 41, gender: 'Female', admittedOn: '2026-07-31', doctor: 'Dr. M. Patel' },
  { id: 'B-108', ward: 'General Female', bedNo: 'GF-202', status: 'available', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-109', ward: 'Maternity Wing', bedNo: 'MW-01', status: 'occupied', patientName: 'Pooja Hegde', age: 28, gender: 'Female', admittedOn: '2026-07-30', doctor: 'Dr. Sarah Smith' },
  { id: 'B-110', ward: 'Maternity Wing', bedNo: 'MW-02', status: 'available', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
];

export const MOCK_CITY_HOSPITALS = [
  { id: 'H-01', name: 'City Central Multispecialty Hospital', distance: '1.2 km', totalBeds: 250, availBeds: 42, icuAvail: 4, status: 'online', lat: 12.9716, lng: 77.5946, emergency: true },
  { id: 'H-02', name: 'Apex Care Institute & Trauma Center', distance: '3.8 km', totalBeds: 180, availBeds: 12, icuAvail: 1, status: 'online', lat: 12.9800, lng: 77.6000, emergency: true },
  { id: 'H-03', name: 'St. Jude General Hospital', distance: '5.1 km', totalBeds: 120, availBeds: 0, icuAvail: 0, status: 'offline', lat: 12.9600, lng: 77.5800, emergency: false },
  { id: 'H-04', name: 'Metro Life Children & Maternity Care', distance: '6.4 km', totalBeds: 90, availBeds: 29, icuAvail: 8, status: 'online', lat: 12.9900, lng: 77.6100, emergency: true },
];

export const MOCK_ADMIN_ANALYTICS = {
  avgWaitTime: '14.2 mins',
  dailyInflow: '342 patients',
  bedTurnover: '88.4%',
  dischargeEfficiency: '94%',
  inflowTrend: [
    { time: '08:00 AM', patients: 25, discharge: 5 },
    { time: '10:00 AM', patients: 68, discharge: 18 },
    { time: '12:00 PM', patients: 95, discharge: 42 },
    { time: '02:00 PM', patients: 74, discharge: 60 },
    { time: '04:00 PM', patients: 52, discharge: 75 },
    { time: '06:00 PM', patients: 38, discharge: 40 },
  ],
  deptWaitTimes: [
    { department: 'Gen Medicine', avgWait: 18, target: 15 },
    { department: 'Cardiology', avgWait: 10, target: 12 },
    { department: 'Pediatrics', avgWait: 12, target: 15 },
    { department: 'Orthopedics', avgWait: 22, target: 20 },
    { department: 'Emergency', avgWait: 4, target: 5 },
  ]
};
