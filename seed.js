const dotenv = require('dotenv'); dotenv.config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo users
    await User.deleteMany({ email: { $in: ['admin@medicloud.com', 'doctor@medicloud.com', 'patient@medicloud.com', 'dr.sharma@medicloud.com', 'dr.patel@medicloud.com'] } });

    // Create Admin
    const admin = await User.create({ name: 'Admin User', email: 'admin@medicloud.com', password: 'Admin@123', role: 'admin', phone: '9000000001', isActive: true });
    console.log('✅ Admin created:', admin.email);

    // Create Doctors
    const doctorData = [
      { name: 'Dr. Rajesh Sharma', email: 'doctor@medicloud.com', password: 'Doctor@123', phone: '9000000002', spec: 'Cardiology', fee: 800, exp: 12, dept: 'Cardiac Sciences', bio: 'Senior cardiologist with 12 years of experience. Expert in interventional cardiology and heart failure management.', rating: 4.8 },
      { name: 'Dr. Priya Patel', email: 'dr.sharma@medicloud.com', password: 'Doctor@123', phone: '9000000003', spec: 'Neurology', fee: 900, exp: 10, dept: 'Neuro Sciences', bio: 'Neurologist specializing in stroke management and epilepsy. 10 years of clinical experience.', rating: 4.7 },
      { name: 'Dr. Amit Kumar', email: 'dr.patel@medicloud.com', password: 'Doctor@123', phone: '9000000004', spec: 'Pediatrics', fee: 600, exp: 8, dept: 'Child Health', bio: 'Pediatrician with expertise in neonatal care and child development.', rating: 4.9 },
    ];

    for (const d of doctorData) {
      const user = await User.create({ name: d.name, email: d.email, password: d.password, role: 'doctor', phone: d.phone, isActive: true });
      await Doctor.create({
        user: user._id,
        specialization: d.spec,
        licenseNumber: `MCI${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        department: d.dept,
        experience: d.exp,
        bio: d.bio,
        consultationFee: d.fee,
        rating: d.rating,
        totalReviews: Math.floor(Math.random() * 200) + 50,
        isAvailableForTeleconsult: true,
        languages: ['English', 'Hindi'],
        availability: {
          monday: { available: true, start: '09:00', end: '17:00' },
          tuesday: { available: true, start: '09:00', end: '17:00' },
          wednesday: { available: true, start: '09:00', end: '17:00' },
          thursday: { available: true, start: '09:00', end: '17:00' },
          friday: { available: true, start: '09:00', end: '17:00' },
          saturday: { available: true, start: '09:00', end: '13:00' },
          sunday: { available: false },
        },
      });
      console.log(`✅ Doctor created: ${user.email}`);
    }

    // Create Patient
    const patient = await User.create({ name: 'John Doe', email: 'patient@medicloud.com', password: 'Patient@123', role: 'patient', phone: '9000000005', isActive: true });
    await Patient.create({
      user: patient._id,
      dateOfBirth: new Date('1990-05-15'),
      gender: 'male',
      bloodType: 'O+',
      address: { street: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400001' },
      allergies: ['Penicillin', 'Sulfa drugs'],
      chronicConditions: ['Hypertension'],
      vitals: { height: 175, weight: 72, bloodPressure: '130/85', heartRate: 78, oxygenSaturation: 98 },
    });
    console.log('✅ Patient created:', patient.email);

    console.log('\n🎉 Seed completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo Credentials:');
    console.log('  Admin:   admin@medicloud.com / Admin@123');
    console.log('  Doctor:  doctor@medicloud.com / Doctor@123');
    console.log('  Patient: patient@medicloud.com / Patient@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
