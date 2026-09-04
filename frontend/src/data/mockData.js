// Centralized Mock Data Store for AI Hospital & Discharge Assistance

export const MOCK_PATIENTS_QUEUE = [
  { id: 'P-101', name: 'Ramesh Kumar', age: 45, gender: 'Male', token: 'A-012', department: 'General Medicine', doctor: 'Dr. Sarah Smith', status: 'In Consultation', waitTime: '12 mins', history: ['Hypertension (2021)', 'Appendectomy (2018)'] },
  { id: 'P-102', name: 'Priya Sharma', age: 32, gender: 'Female', token: 'A-013', department: 'Cardiology', doctor: 'Dr. Vikas Rao', status: 'Waiting', waitTime: '18 mins', history: ['Mild Asthma', 'Allergy: Penicillin'] },
  { id: 'P-103', name: 'Anish Verma', age: 58, gender: 'Male', token: 'A-014', department: 'Orthopedics', doctor: 'Dr. Anita Roy', status: 'Waiting', waitTime: '25 mins', history: ['Osteoarthritis Right Knee'] },
  { id: 'P-104', name: 'Sunita Devi', age: 67, gender: 'Female', token: 'A-015', department: 'General Medicine', doctor: 'Dr. Sarah Smith', status: 'Waiting', waitTime: '32 mins', history: ['Type 2 Diabetes', 'Hypertension'] },
  { id: 'P-105', name: 'Karthik Raja', age: 29, gender: 'Male', token: 'A-016', department: 'Pediatrics', doctor: 'Dr. M. Patel', status: 'Completed', waitTime: '0 mins', history: ['Acute Bronchitis'] },
  { id: 'P-106', name: 'Lakshmi Narayanan', age: 54, gender: 'Female', token: 'A-017', department: 'Neurology', doctor: 'Dr. Rajesh Khanna', status: 'Waiting', waitTime: '40 mins', history: ['Migraine with Aura'] },
  { id: 'P-107', name: 'Vikram Singh', age: 39, gender: 'Male', token: 'A-018', department: 'Cardiology', doctor: 'Dr. Vikas Rao', status: 'Waiting', waitTime: '45 mins', history: ['Hyperlipidemia'] },
];

export const MOCK_BEDS = [
  { id: 'B-101', ward: 'ICU Block A', bedNo: 'ICU-01', specialty: 'ICU', status: 'occupied', patientName: 'Vikram Mehta', age: 62, gender: 'Male', admittedOn: '2026-07-28', doctor: 'Dr. Sarah Smith' },
  { id: 'B-102', ward: 'ICU Block A', bedNo: 'ICU-02', specialty: 'ICU', status: 'available', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-103', ward: 'ICU Block A', bedNo: 'ICU-03', specialty: 'ICU', status: 'occupied', patientName: 'Deepa Menon', age: 49, gender: 'Female', admittedOn: '2026-07-29', doctor: 'Dr. Vikas Rao' },
  { id: 'B-104', ward: 'General Male', bedNo: 'GM-101', specialty: 'General', status: 'available', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-105', ward: 'General Male', bedNo: 'GM-102', specialty: 'General', status: 'occupied', patientName: 'Amit Shah', age: 53, gender: 'Male', admittedOn: '2026-07-30', doctor: 'Dr. Anita Roy' },
  { id: 'B-106', ward: 'General Male', bedNo: 'GM-103', specialty: 'General', status: 'cleaning', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-107', ward: 'General Female', bedNo: 'GF-201', specialty: 'General', status: 'reserved', patientName: 'Meena Kumari', age: 41, gender: 'Female', admittedOn: '2026-07-31', doctor: 'Dr. M. Patel' },
  { id: 'B-108', ward: 'General Female', bedNo: 'GF-202', specialty: 'General', status: 'available', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-109', ward: 'Maternity Wing', bedNo: 'MW-01', specialty: 'Maternity', status: 'occupied', patientName: 'Pooja Hegde', age: 28, gender: 'Female', admittedOn: '2026-07-30', doctor: 'Dr. Sarah Smith' },
  { id: 'B-110', ward: 'Maternity Wing', bedNo: 'MW-02', specialty: 'Maternity', status: 'available', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-111', ward: 'ICU Block B', bedNo: 'ICU-04', specialty: 'ICU', status: 'available', patientName: null, age: null, gender: null, admittedOn: null, doctor: null },
  { id: 'B-112', ward: 'General Female', bedNo: 'GF-203', specialty: 'General', status: 'occupied', patientName: 'Kavita Subramanian', age: 36, gender: 'Female', admittedOn: '2026-08-01', doctor: 'Dr. Rajesh Khanna' }
];

export const MOCK_CITY_HOSPITALS = [
  { 
    id: 'H-01', 
    name: 'City Central Multispecialty Hospital', 
    address: '12 Health Boulevard, Downtown',
    distance: '1.2 km', 
    totalBeds: 250, 
    availBeds: 42, 
    icuAvail: 4, 
    generalAvail: 28,
    maternityAvail: 10,
    status: 'online', 
    lat: 12.9716, 
    lng: 77.5946, 
    emergency: true,
    contact: '+91 80 2345 6789'
  },
  { 
    id: 'H-02', 
    name: 'Apex Care Institute & Trauma Center', 
    address: '88 Ring Road, Sector 4',
    distance: '3.8 km', 
    totalBeds: 180, 
    availBeds: 12, 
    icuAvail: 1, 
    generalAvail: 8,
    maternityAvail: 3,
    status: 'online', 
    lat: 12.9800, 
    lng: 77.6000, 
    emergency: true,
    contact: '+91 80 8765 4321'
  },
  { 
    id: 'H-03', 
    name: 'St. Jude General Hospital', 
    address: '45 Church Street',
    distance: '5.1 km', 
    totalBeds: 120, 
    availBeds: 0, 
    icuAvail: 0, 
    generalAvail: 0,
    maternityAvail: 0,
    status: 'offline', 
    lat: 12.9600, 
    lng: 77.5800, 
    emergency: false,
    contact: '+91 80 5555 1234'
  },
  { 
    id: 'H-04', 
    name: 'Metro Life Children & Maternity Care', 
    address: '102 Green Park Avenue',
    distance: '6.4 km', 
    totalBeds: 90, 
    availBeds: 29, 
    icuAvail: 8, 
    generalAvail: 6,
    maternityAvail: 15,
    status: 'online', 
    lat: 12.9900, 
    lng: 77.6100, 
    emergency: true,
    contact: '+91 80 9999 8888'
  },
  { 
    id: 'H-05', 
    name: 'Sunrise Super Specialty Hospital', 
    address: '19 Airport Road',
    distance: '8.2 km', 
    totalBeds: 300, 
    availBeds: 68, 
    icuAvail: 12, 
    generalAvail: 45,
    maternityAvail: 11,
    status: 'online', 
    lat: 12.9500, 
    lng: 77.6300, 
    emergency: true,
    contact: '+91 80 4444 3333'
  }
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
    { time: '08:00 PM', patients: 22, discharge: 15 },
  ],
  deptWaitTimes: [
    { department: 'Gen Medicine', avgWait: 18, target: 15 },
    { department: 'Cardiology', avgWait: 10, target: 12 },
    { department: 'Pediatrics', avgWait: 12, target: 15 },
    { department: 'Orthopedics', avgWait: 22, target: 20 },
    { department: 'Emergency', avgWait: 4, target: 5 },
    { department: 'Neurology', avgWait: 16, target: 15 },
  ],
  staffAllocation: [
    { id: 1, department: 'General Medicine', activeDoctors: 8, dutyNurses: 16, totalBeds: 80, occupiedBeds: 72, occupancyRate: '90%' },
    { id: 2, department: 'Cardiology & ICU', activeDoctors: 5, dutyNurses: 14, totalBeds: 40, occupiedBeds: 35, occupancyRate: '87.5%' },
    { id: 3, department: 'Orthopedics', activeDoctors: 4, dutyNurses: 8, totalBeds: 30, occupiedBeds: 21, occupancyRate: '70%' },
    { id: 4, department: 'Pediatrics & Maternity', activeDoctors: 6, dutyNurses: 12, totalBeds: 50, occupiedBeds: 38, occupancyRate: '76%' },
    { id: 5, department: 'Emergency & Trauma', activeDoctors: 7, dutyNurses: 18, totalBeds: 25, occupiedBeds: 24, occupancyRate: '96%' },
  ],
  bottlenecks: [
    { type: 'warning', title: 'Emergency Ward Capacity Alert', message: 'Emergency ward at 96% occupancy. 2 ambulances in route.' },
    { type: 'info', title: 'Discharge Velocity High', message: 'Ward Block B cleared 12 beds in the past 2 hours.' },
    { type: 'success', title: 'Staffing Optimal', message: 'Doctor-to-Patient ratio in ICU is at peak standard 1:2.' }
  ]
};

export const MOCK_DISCHARGE_SAMPLE = {
  demographics: {
    name: 'Rajesh Sharma',
    age: '52',
    gender: 'Male',
    uhid: 'UHID-992014',
    admDate: '2026-08-01',
    disDate: '2026-08-07',
    doctor: 'Dr. Sarah Smith (MD, Cardiology)',
    ward: 'ICU Block A - Bed 01'
  },
  chiefComplaint: 'Severe retrosternal chest pain radiating to left arm accompanied by diaphoresis and shortness of breath starting 6 hours prior to admission.',
  primaryDx: 'Acute Anterior Wall ST-Elevation Myocardial Infarction (STEMI)',
  secondaryDx: 'Type 2 Diabetes Mellitus, Essential Hypertension',
  riskClass: 'High',
  vitals: {
    bpAdm: '160/95', bpDis: '122/78',
    hrAdm: '110', hrDis: '72',
    spO2Adm: '91%', spO2Dis: '98%',
    tempAdm: '37.8°C', tempDis: '36.6°C'
  },
  investigations: [
    { id: 1, test: 'Troponin I (Admission)', result: '4.8 ng/mL', normal: '< 0.04 ng/mL' },
    { id: 2, test: '12-Lead ECG', result: 'ST Elevation V1-V4', normal: 'Normal Sinus Rhythm' },
    { id: 3, test: 'Echocardiogram (2D)', result: 'LVEF 45%, Anterior Hypokinesia', normal: 'LVEF > 55%' },
    { id: 4, test: 'HbA1c', result: '7.8%', normal: '< 5.7%' },
    { id: 5, test: 'Serum Creatinine', result: '0.9 mg/dL', normal: '0.7 - 1.2 mg/dL' }
  ],
  procedures: ['Primary Percutaneous Coronary Intervention (PCI)', 'DES Stent to LAD', 'Femoral Hemostasis Device'],
  medications: [
    { id: 1, drug: 'Tab. Aspirin', dose: '75 mg', frequency: 'Once daily (Morning)', duration: 'Indefinitely' },
    { id: 2, drug: 'Tab. Ticagrelor', dose: '90 mg', frequency: 'Twice daily', duration: '12 Months' },
    { id: 3, drug: 'Tab. Atorvastatin', dose: '80 mg', frequency: 'Once daily at bedtime', duration: 'Indefinitely' },
    { id: 4, drug: 'Tab. Metoprolol Succinate', dose: '25 mg', frequency: 'Once daily', duration: 'Ongoing' },
    { id: 5, drug: 'Tab. Ramipril', dose: '2.5 mg', frequency: 'Once daily', duration: 'Ongoing' }
  ],
  followUpDate: '2026-08-14',
  followUpDept: 'Cardiology OPD - Room 104',
  conditionAtDischarge: 'Stable',
  rawNotes: 'Patient underwent successful primary PCI with drug-eluting stent placement to proximal LAD. Post-procedure clinical course was uneventful without recurring angina or dyspnea. Hemodynamics stabilized. Educated on low-sodium cardiac diet, smoking cessation, daily BP/HR monitoring, and strict compliance with dual antiplatelet therapy.'
};
