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
