const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('../models/Employee');

const backfill = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const employees = await Employee.find({
      $or: [{ employeeCode: { $exists: false } }, { employeeCode: null }]
    }).sort({ createdAt: 1 });

    console.log(`Found ${employees.length} employees without an ID`);

    let counter = 1;
    for (const emp of employees) {
      emp.employeeCode = `EMP${String(counter).padStart(4, '0')}`;
      await emp.save();
      console.log(`Assigned ${emp.employeeCode} to ${emp.name}`);
      counter++;
    }

    console.log('Backfill complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

backfill();