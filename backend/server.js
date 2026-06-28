const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
// Import Routes (we'll add these soon)
require('./models/Employee');
require('./models/Skill');
require('./models/Project');
require('./models/User');

const app = express();

// Middleware
//app.use(cors());
app.use(cors({
  origin: ['http://localhost:3000', 
           'https://workpulse-frontend.vercel.app',
           'https://workpulse-miniquin06.vercel.app',
           /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/hr-chat', require('./routes/hrChatRoutes'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Skill Intelligence Platform API is running 🚀' });
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error('❌ DB Connection Error:', err));