const dotenv = require('dotenv'); dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const MedicalRecord = require('./models/MedicalRecord');
const Notification = require('./models/Notification');
const Hospital = require('./models/Hospital');
const { v4: uuidv4 } = require('uuid');
const mockSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ─── Fetch existing seeded users ───────────────────────────────
    const doctorUser1 = await User.findOne({ email: 'doctor@medicloud.com' });
    const doctorUser2 = await User.findOne({ email: 'dr.sharma@medicloud.com' });
    const doctorUser3 = await User.findOne({ email: 'dr.patel@medicloud.com' });
    const patientUser  = await User.findOne({ email: 'patient@medicloud.com' });
    const adminUser    = await User.findOne({ email: 'admin@medicloud.com'   });

    if (!doctorUser1 || !patientUser) {
      console.error('❌ Run seed.js first to create base users!');
      process.exit(1);
    }

    // ─── Create extra patients ──────────────────────────────────────
    const extraPatientEmails = [
      { email: 'sara.johnson@email.com',  name: 'Sara Johnson',  phone: '9111111111' },
      { email: 'rahul.verma@email.com',   name: 'Rahul Verma',   phone: '9222222222' },
      { email: 'meera.nair@email.com',    name: 'Meera Nair',    phone: '9333333333' },
      { email: 'arjun.singh@email.com',   name: 'Arjun Singh',   phone: '9444444444' },
    ];

    const extraPatients = [];
    for (const ep of extraPatientEmails) {
      let u = await User.findOne({ email: ep.email });
      if (!u) {
        u = await User.create({ name: ep.name, email: ep.email, password: 'Patient@123', role: 'patient', phone: ep.phone, isActive: true });
        await Patient.create({
          user: u._id,
          dateOfBirth: new Date(1985 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: ['male', 'female'][Math.floor(Math.random() * 2)],
          bloodType: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
          address: { city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'][Math.floor(Math.random() * 4)], country: 'India' },
          allergies: [['Penicillin', 'Aspirin', 'Sulfa drugs', 'Latex'][Math.floor(Math.random() * 4)]],
          chronicConditions: [['Hypertension', 'Diabetes', 'Asthma', 'Arthritis'][Math.floor(Math.random() * 4)]],
          vitals: {
            height: 155 + Math.floor(Math.random() * 30),
            weight: 55 + Math.floor(Math.random() * 40),
            bloodPressure: `${110 + Math.floor(Math.random() * 40)}/${70 + Math.floor(Math.random() * 20)}`,
            heartRate: 65 + Math.floor(Math.random() * 30),
            oxygenSaturation: 95 + Math.floor(Math.random() * 5),
          },
        });
        console.log(`✅ Patient created: ${ep.email}`);
      }
      extraPatients.push(u);
    }

    const allPatients = [patientUser, ...extraPatients];
    const allDoctors  = [doctorUser1, doctorUser2, doctorUser3].filter(Boolean);

    // ─── Clear old mock appointments / prescriptions / records / notifications / hospitals ──
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Notification.deleteMany({});
    await Hospital.deleteMany({});
    console.log('🗑️  Cleared old appointments, prescriptions, records, notifications, hospitals');

    // ─── Hospitals ──────────────────────────────────────────────────
    const hospitalData = [
      {
        name: 'Apollo Spectra Hospital',
        description: 'Multi-specialty hospital with advanced infrastructure and world-class care.',
        address: { street: 'Main Road, Koramangala', city: 'Bangalore', state: 'Karnataka', country: 'India', zipCode: '560034', coordinates: { lat: 12.9279, lng: 77.6271 } },
        phone: '+91-80-12345678',
        email: 'contact.blr@apollospectra.com',
        website: 'https://www.apollospectra.com',
        services: ['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Emergency'],
        departments: ['OPD', 'IPD', 'ICU', 'Radiology', 'Pathology'],
        totalBeds: 250,
        availableBeds: 45,
        rating: 4.8,
        totalReviews: 1240,
        type: 'private',
        accreditation: ['NABH', 'NABL'],
        established: 1995
      },
      {
        name: 'AIIMS New Delhi',
        description: 'Premier government medical college and hospital providing subsidized healthcare.',
        address: { street: 'Ansari Nagar', city: 'Delhi', state: 'Delhi', country: 'India', zipCode: '110029', coordinates: { lat: 28.5659, lng: 77.2093 } },
        phone: '+91-11-26588500',
        email: 'info@aiims.edu',
        website: 'https://www.aiims.edu',
        services: ['Pediatrics', 'Oncology', 'Emergency', 'Surgery', 'Dermatology'],
        departments: ['Emergency', 'Surgery', 'Outpatient', 'Pediatrics'],
        totalBeds: 2500,
        availableBeds: 120,
        rating: 4.9,
        totalReviews: 8500,
        type: 'government',
        accreditation: ['NABH', 'NMC'],
        established: 1956
      },
      {
        name: 'Fortis Hospital Mumbai',
        description: 'JCI accredited world-class hospital specializing in cardiac care and organ transplants.',
        address: { street: 'Mulund Goregaon Link Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400078', coordinates: { lat: 19.1663, lng: 72.9365 } },
        phone: '+91-22-43654365',
        email: 'mulund@fortishealthcare.com',
        website: 'https://www.fortishealthcare.com',
        services: ['Cardiology', 'Neurology', 'Orthopedics', 'Gastroenterology'],
        departments: ['ICU', 'Cardiac Unit', 'Orthopedics', 'Emergency'],
        totalBeds: 300,
        availableBeds: 60,
        rating: 4.6,
        totalReviews: 2100,
        type: 'private',
        accreditation: ['JCI', 'NABH'],
        established: 2002
      }
    ];

    const createdHospitals = await Hospital.insertMany(hospitalData);
    console.log(`✅ ${createdHospitals.length} hospitals created`);

    // ─── Update Doctors with Hospital info & Services ───────────────
    if (doctorUser1) {
      await Doctor.findOneAndUpdate({ user: doctorUser1._id }, { 
        hospital: createdHospitals[0]._id,
        services: ['Cardiology', 'ECG', 'Echocardiogram', 'Stress Test']
      });
    }
    if (doctorUser2) {
      await Doctor.findOneAndUpdate({ user: doctorUser2._id }, { 
        hospital: createdHospitals[2]._id,
        services: ['Neurology', 'EEG', 'Stroke Rehab', 'Headache Management']
      });
    }
    if (doctorUser3) {
      await Doctor.findOneAndUpdate({ user: doctorUser3._id }, { 
        hospital: createdHospitals[1]._id,
        services: ['Pediatrics', 'Vaccinations', 'Growth Monitoring', 'Child Nutrition']
      });
    }

    // ─── Helper dates ───────────────────────────────────────────────
    const daysAgo  = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(10, 0, 0, 0); return d; };
    const daysAhead = (n) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(10, 0, 0, 0); return d; };
    const TIME_SLOTS = ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'];
    const slot = () => TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];

    // ─── Appointments ───────────────────────────────────────────────
    const appointmentData = [
      // John Doe (main patient) — past completed
      { patient: patientUser._id, doctor: doctorUser1._id, date: daysAgo(30), timeSlot: '10:00 AM', type: 'in-person',   status: 'completed', reason: 'Chest pain and breathlessness',        diagnosis: 'Mild hypertension, recommended lifestyle changes' },
      { patient: patientUser._id, doctor: doctorUser2._id, date: daysAgo(20), timeSlot: '11:00 AM', type: 'teleconsult', status: 'completed', reason: 'Recurring headaches and dizziness',     diagnosis: 'Tension headache, prescribed medication' },
      { patient: patientUser._id, doctor: doctorUser3._id, date: daysAgo(10), timeSlot: '09:00 AM', type: 'in-person',   status: 'completed', reason: 'Annual health checkup',                  diagnosis: 'Healthy, minor vitamin D deficiency' },
      // John Doe — upcoming
      { patient: patientUser._id, doctor: doctorUser1._id, date: daysAhead(3),  timeSlot: '02:00 PM', type: 'teleconsult', status: 'confirmed', reason: 'Follow-up: blood pressure monitoring',  roomId: uuidv4() },
      { patient: patientUser._id, doctor: doctorUser2._id, date: daysAhead(7),  timeSlot: '11:00 AM', type: 'in-person',   status: 'pending',   reason: 'Neurological evaluation follow-up' },
      { patient: patientUser._id, doctor: doctorUser3._id, date: daysAhead(14), timeSlot: '09:00 AM', type: 'in-person',   status: 'pending',   reason: 'Vitamin supplement check and review' },

      // Sara Johnson
      { patient: extraPatients[0]._id, doctor: doctorUser1._id, date: daysAgo(15), timeSlot: '10:00 AM', type: 'in-person',   status: 'completed', reason: 'Shortness of breath',     diagnosis: 'Mild arrhythmia detected, medication started' },
      { patient: extraPatients[0]._id, doctor: doctorUser1._id, date: daysAhead(2), timeSlot: '03:00 PM', type: 'teleconsult', status: 'confirmed', reason: 'Follow-up arrhythmia',    roomId: uuidv4() },
      // Rahul Verma
      { patient: extraPatients[1]._id, doctor: doctorUser2._id, date: daysAgo(8),  timeSlot: '11:00 AM', type: 'in-person',   status: 'completed', reason: 'Severe migraines',         diagnosis: 'Chronic migraine, triptan therapy recommended' },
      { patient: extraPatients[1]._id, doctor: doctorUser2._id, date: daysAhead(5), timeSlot: '10:00 AM', type: 'teleconsult', status: 'pending',   reason: 'Migraine frequency check', roomId: uuidv4() },
      // Meera Nair
      { patient: extraPatients[2]._id, doctor: doctorUser3._id, date: daysAgo(5),   timeSlot: '09:00 AM', type: 'in-person',   status: 'completed', reason: 'Fever in child',           diagnosis: 'Viral infection, supportive care' },
      { patient: extraPatients[2]._id, doctor: doctorUser3._id, date: daysAgo(3),   timeSlot: '04:00 PM', type: 'in-person',   status: 'no-show',   reason: 'Follow-up fever' },
      // Arjun Singh
      { patient: extraPatients[3]._id, doctor: doctorUser1._id, date: daysAgo(2), timeSlot: '02:00 PM', type: 'in-person',   status: 'completed', reason: 'Palpitations and fatigue', diagnosis: 'Stress-induced cardiac stress, lifestyle advice' },
      { patient: extraPatients[3]._id, doctor: doctorUser1._id, date: daysAhead(1), timeSlot: '11:00 AM', type: 'teleconsult', status: 'confirmed', reason: 'Stress management consult', roomId: uuidv4() },
    ];

    const createdAppointments = await Appointment.insertMany(appointmentData);
    console.log(`✅ ${createdAppointments.length} appointments created`);

    // ─── Prescriptions ──────────────────────────────────────────────
    const completedAppts = createdAppointments.filter(a => a.status === 'completed');
    const prescriptionsData = [
      {
        patient: patientUser._id, doctor: doctorUser1._id, appointment: completedAppts[0]._id,
        diagnosis: 'Mild Hypertension',
        medications: [
          { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily (morning)', duration: '30 days', instructions: 'Take with or without food. Monitor BP daily.' },
          { name: 'Losartan 50mg',  dosage: '50mg', frequency: 'Once daily (evening)',  duration: '30 days', instructions: 'Avoid potassium-rich foods in excess.' },
        ],
        notes: 'Reduce sodium intake, 30 min walk daily. Return in 4 weeks.',
        validUntil: daysAhead(30),
      },
      {
        patient: patientUser._id, doctor: doctorUser2._id, appointment: completedAppts[1]._id,
        diagnosis: 'Tension Headache',
        medications: [
          { name: 'Paracetamol 500mg',    dosage: '500mg',  frequency: 'Twice daily (as needed)',           duration: '7 days',  instructions: 'Take with water, not on empty stomach.' },
          { name: 'Ibuprofen 400mg',      dosage: '400mg',  frequency: 'Three times daily after meals',     duration: '5 days',  instructions: 'Avoid alcohol. Take with food.' },
          { name: 'Vitamin B Complex',    dosage: '1 tab',  frequency: 'Once daily (after breakfast)',       duration: '30 days', instructions: 'Improves nerve function.' },
        ],
        notes: 'Reduce screen time, take breaks every hour. Stay hydrated.',
        validUntil: daysAhead(15),
      },
      {
        patient: patientUser._id, doctor: doctorUser3._id, appointment: completedAppts[2]._id,
        diagnosis: 'Vitamin D Deficiency',
        medications: [
          { name: 'Vitamin D3 60000 IU',  dosage: '60000 IU', frequency: 'Once weekly',      duration: '8 weeks',  instructions: 'Take with fatty food for absorption.' },
          { name: 'Calcium Carbonate 500mg', dosage: '500mg', frequency: 'Twice daily',        duration: '60 days', instructions: 'Take after meals for best absorption.' },
        ],
        notes: 'Get 15-20 min of sunlight daily. Retest after 2 months.',
        validUntil: daysAhead(60),
      },
      {
        patient: extraPatients[0]._id, doctor: doctorUser1._id, appointment: completedAppts[4]._id,
        diagnosis: 'Mild Arrhythmia',
        medications: [
          { name: 'Metoprolol 25mg',      dosage: '25mg',   frequency: 'Twice daily',                      duration: '30 days', instructions: 'Do not stop suddenly. Monitor heart rate.' },
          { name: 'Aspirin 75mg',         dosage: '75mg',   frequency: 'Once daily after dinner',          duration: '30 days', instructions: 'Take with antacid if GI discomfort.' },
        ],
        notes: 'Avoid caffeine and alcohol. Holter monitor in 2 weeks.',
        validUntil: daysAhead(30),
      },
      {
        patient: extraPatients[1]._id, doctor: doctorUser2._id, appointment: completedAppts[5]._id,
        diagnosis: 'Chronic Migraine',
        medications: [
          { name: 'Sumatriptan 50mg',     dosage: '50mg',   frequency: 'At onset of migraine (max 2/day)', duration: '10 days', instructions: 'Take at first sign of migraine.' },
          { name: 'Amitriptyline 10mg',   dosage: '10mg',   frequency: 'Once at bedtime',                  duration: '30 days', instructions: 'May cause drowsiness.' },
          { name: 'Magnesium Glycinate',  dosage: '400mg',  frequency: 'Once daily at night',              duration: '60 days', instructions: 'Helps reduce migraine frequency.' },
        ],
        notes: 'Keep a migraine diary. Identify and avoid triggers (stress, sleep deprivation).',
        validUntil: daysAhead(45),
      },
    ];

    const createdPrescriptions = await Prescription.insertMany(prescriptionsData);
    console.log(`✅ ${createdPrescriptions.length} prescriptions created`);

    // Link prescriptions to appointments
    await Appointment.findByIdAndUpdate(completedAppts[0]._id, { prescription: createdPrescriptions[0]._id });
    await Appointment.findByIdAndUpdate(completedAppts[1]._id, { prescription: createdPrescriptions[1]._id });
    await Appointment.findByIdAndUpdate(completedAppts[2]._id, { prescription: createdPrescriptions[2]._id });

    // ─── Medical Records ────────────────────────────────────────────
    const medicalRecordsData = [
      {
        patient: patientUser._id, doctor: doctorUser1._id, appointment: completedAppts[0]._id,
        type: 'lab-result', title: 'Complete Blood Count (CBC)',
        description: 'Routine CBC test for annual checkup',
        diagnosis: 'Mild hypertension',
        findings: 'WBC: 7.2 (normal). RBC: 4.8 (normal). Hemoglobin: 14.2 g/dL (normal). Platelet: 250000 (normal). Cholesterol: 215 mg/dL (borderline high).',
        tags: ['CBC', 'blood-test', 'annual-checkup'],
      },
      {
        patient: patientUser._id, doctor: doctorUser1._id, appointment: completedAppts[0]._id,
        type: 'consultation-note', title: 'Cardiology Consultation Note',
        description: 'Initial cardiology consultation for hypertension management',
        diagnosis: 'Stage 1 Hypertension (140/90 mmHg)',
        findings: 'Patient presents with elevated BP readings. ECG normal. No signs of target organ damage. Lifestyle modification advised along with pharmacotherapy.',
        tags: ['hypertension', 'cardiology', 'consultation'],
      },
      {
        patient: patientUser._id, doctor: doctorUser2._id, appointment: completedAppts[1]._id,
        type: 'consultation-note', title: 'Neurology Assessment — Tension Headache',
        description: 'Neurological evaluation for recurrent headaches',
        diagnosis: 'Episodic Tension-Type Headache (ETTH)',
        findings: 'Bilateral pressing/tightening pain. Duration 30min–2hrs. No nausea/vomiting. No photophobia. MRI not indicated at this stage. Screen-time > 8hrs/day likely a trigger.',
        tags: ['headache', 'neurology', 'tension-headache'],
      },
      {
        patient: patientUser._id, doctor: doctorUser3._id, appointment: completedAppts[2]._id,
        type: 'lab-result', title: 'Vitamin D & Calcium Panel',
        description: 'Blood panel for vitamin D and calcium levels',
        diagnosis: 'Vitamin D Deficiency',
        findings: '25-OH Vitamin D: 14 ng/mL (deficient — normal >30). Calcium: 9.1 mg/dL (normal). Parathyroid Hormone: 62 pg/mL (mildly elevated). Supplementation recommended.',
        tags: ['vitamin-d', 'calcium', 'lab-test'],
      },
      {
        patient: patientUser._id, doctor: doctorUser3._id,
        type: 'imaging', title: 'Chest X-Ray Report',
        description: 'PA view chest radiograph',
        diagnosis: 'Normal study',
        findings: 'Heart size normal. Lungs clear. No pleural effusion. No pneumothorax. Bony skeleton intact.',
        tags: ['xray', 'chest', 'radiology'],
      },
      {
        patient: extraPatients[0]._id, doctor: doctorUser1._id, appointment: completedAppts[4]._id,
        type: 'lab-result', title: 'Holter Monitor Report (24hr)',
        description: '24-hour ambulatory cardiac monitoring',
        diagnosis: 'Paroxysmal Atrial Fibrillation',
        findings: 'Sinus rhythm 68% of recording. 3 episodes of paroxysmal AF, longest 4 minutes. Max HR 142 bpm. Avg HR 76 bpm. No ST changes.',
        tags: ['holter', 'cardiac', 'arrhythmia', 'ECG'],
      },
      {
        patient: extraPatients[1]._id, doctor: doctorUser2._id, appointment: completedAppts[5]._id,
        type: 'imaging', title: 'MRI Brain — Migraine Workup',
        description: 'MRI scan of brain with and without contrast for headache evaluation',
        diagnosis: 'No structural abnormality',
        findings: 'No space occupying lesion. No infarct or bleed. Ventricles normal. White matter small foci of T2 hyperintensity — likely migraine-associated. No midline shift.',
        tags: ['MRI', 'brain', 'imaging', 'migraine'],
      },
      {
        patient: extraPatients[3]._id, doctor: doctorUser1._id, appointment: completedAppts[8]._id,
        type: 'lab-result', title: 'Stress Echo + Lipid Panel',
        description: 'Cardiac stress test and lipid profile',
        diagnosis: 'Dyslipidemia with stress-induced cardiac changes',
        findings: 'LDL: 165 mg/dL (high). HDL: 38 mg/dL (low). Total Cholesterol: 240 mg/dL. Triglycerides: 220 mg/dL. Stress echo: no inducible ischemia but reduced EF at peak — 52%.',
        tags: ['lipid', 'stress-test', 'cardiac', 'dyslipidemia'],
      },
    ];

    const createdRecords = await MedicalRecord.insertMany(medicalRecordsData);
    console.log(`✅ ${createdRecords.length} medical records created`);

    // ─── Notifications ──────────────────────────────────────────────
    const notificationsData = [
      // Patient notifications
      { recipient: patientUser._id, type: 'appointment', isRead: false, title: '📅 Appointment Confirmed', message: 'Your teleconsult with Dr. Rajesh Sharma on ' + daysAhead(3).toLocaleDateString() + ' at 02:00 PM has been confirmed. Join link will be available 5 minutes before.' },
      { recipient: patientUser._id, type: 'appointment', isRead: false, title: '⏰ Appointment Reminder', message: 'You have an upcoming appointment with Dr. Priya Patel in 7 days. Please prepare your symptom diary.' },
      { recipient: patientUser._id, type: 'prescription', isRead: false, title: '💊 New Prescription Ready', message: 'Dr. Rajesh Sharma has issued a prescription for Hypertension management. View it in your prescriptions section.' },
      { recipient: patientUser._id, type: 'prescription', isRead: true,  title: '💊 Prescription Updated', message: 'Dr. Amit Kumar has added Vitamin D3 supplementation to your treatment plan.' },
      { recipient: patientUser._id, type: 'record',       isRead: false, title: '🔬 Lab Results Ready', message: 'Your CBC and Vitamin D lab results are now available in Medical Records. Please review and consult your doctor.' },
      { recipient: patientUser._id, type: 'reminder',     isRead: true,  title: '💉 Medication Reminder', message: 'Remember to take your Amlodipine 5mg this morning with breakfast.' },
      { recipient: patientUser._id, type: 'system',       isRead: true,  title: '✅ Profile Complete', message: 'Your health profile is 80% complete. Add emergency contact to improve it.' },

      // Doctor 1 (Cardiology) notifications
      { recipient: doctorUser1._id, type: 'appointment', isRead: false, title: '📋 New Appointment', message: 'John Doe has booked a teleconsult follow-up for ' + daysAhead(3).toLocaleDateString() + ' at 02:00 PM.' },
      { recipient: doctorUser1._id, type: 'appointment', isRead: false, title: '📋 New Appointment', message: 'Sara Johnson has booked a follow-up for arrhythmia monitoring on ' + daysAhead(2).toLocaleDateString() + '.' },
      { recipient: doctorUser1._id, type: 'appointment', isRead: true,  title: '✅ Appointment Completed', message: 'Appointment with Arjun Singh has been marked as completed. Prescription saved.' },
      { recipient: doctorUser1._id, type: 'system',      isRead: false, title: '📊 Weekly Summary', message: 'You attended 4 appointments this week with a 100% attendance rate. 3 prescriptions issued.' },

      // Doctor 2 (Neurology) notifications
      { recipient: doctorUser2._id, type: 'appointment', isRead: false, title: '📋 New Appointment', message: 'Rahul Verma has booked a teleconsult for migraine frequency review on ' + daysAhead(5).toLocaleDateString() + '.' },
      { recipient: doctorUser2._id, type: 'appointment', isRead: true,  title: '📋 New Appointment', message: 'John Doe has booked a neurological evaluation follow-up for ' + daysAhead(7).toLocaleDateString() + '.' },

      // Doctor 3 (Pediatrics) notifications  
      { recipient: doctorUser3._id, type: 'appointment', isRead: false, title: '⚠️ No-Show Alert', message: 'Meera Nair did not attend the scheduled appointment on ' + daysAgo(3).toLocaleDateString() + '. Consider rescheduling.' },
      { recipient: doctorUser3._id, type: 'appointment', isRead: true,  title: '📋 Upcoming Appointment', message: 'John Doe has a vitamin supplement review scheduled for ' + daysAhead(14).toLocaleDateString() + '.' },

      // Extra patients
      { recipient: extraPatients[0]._id, type: 'appointment', isRead: false, title: '📅 Appointment Confirmed', message: 'Your teleconsult with Dr. Rajesh Sharma tomorrow for arrhythmia follow-up is confirmed.' },
      { recipient: extraPatients[1]._id, type: 'prescription', isRead: false, title: '💊 Prescription Ready', message: 'Dr. Priya Patel has prescribed Sumatriptan and Amitriptyline for chronic migraine management.' },
      { recipient: extraPatients[3]._id, type: 'appointment', isRead: false, title: '📅 Teleconsult Tomorrow', message: 'Dr. Rajesh Sharma teleconsult for stress management is confirmed for tomorrow at 11:00 AM.' },
    ];

    const createdNotifications = await Notification.insertMany(notificationsData);
    console.log(`✅ ${createdNotifications.length} notifications created`);

    // ─── Update doctor stats ────────────────────────────────────────
    const d1Patients = await Appointment.distinct('patient', { doctor: doctorUser1._id });
    await Doctor.findOneAndUpdate({ user: doctorUser1._id }, { totalPatients: d1Patients.length });
    if (doctorUser2) {
      const d2Patients = await Appointment.distinct('patient', { doctor: doctorUser2._id });
      await Doctor.findOneAndUpdate({ user: doctorUser2._id }, { totalPatients: d2Patients.length });
    }
    if (doctorUser3) {
      const d3Patients = await Appointment.distinct('patient', { doctor: doctorUser3._id });
      await Doctor.findOneAndUpdate({ user: doctorUser3._id }, { totalPatients: d3Patients.length });
    }
    console.log('✅ Doctor patient counts updated');

    console.log('\n🎉 Mock data seeding complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 ${appointmentData.length} appointments  (past + upcoming)`);
    console.log(`💊 ${prescriptionsData.length} prescriptions`);
    console.log(`🔬 ${medicalRecordsData.length} medical records  (CBC, MRI, X-ray…)`);
    console.log(`🔔 ${notificationsData.length} notifications`);
    console.log(`👥 ${extraPatientEmails.length} extra patients  (Sara, Rahul, Meera, Arjun)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login as: patient@medicloud.com / Patient@123');
    console.log('          doctor@medicloud.com  / Doctor@123');
    console.log('          admin@medicloud.com   / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Mock seed error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

mockSeed();
