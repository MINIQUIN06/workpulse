const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Task = require('../models/Task');
const Project = require('../models/Project');
const axios = require('axios');


exports.hrChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const today = new Date().toISOString().split('T')[0];

    const [employees, leaves, tasks, projects, attendance] = await Promise.all([
      Employee.find().select('name role department experience status skills').limit(20),
      Leave.find({ status: 'pending' }).populate('employee', 'name department').limit(10),
      Task.find({ status: { $ne: 'done' } }).populate('assignedTo', 'name').limit(10),
      Project.find().select('name status').limit(5),
      Attendance.find({ date: today }).populate('employee', 'name').limit(20)
    ]);

    const overdueTasks = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date()
    );
    const reviewTasks = tasks.filter(t => t.status === 'review');
    const deptCount = {};
    employees.forEach(e => {
      deptCount[e.department] = (deptCount[e.department] || 0) + 1;

      console.log('EMPLOYEES FETCHED:', employees.map(e => e.name));
      console.log('ATTENDANCE TODAY:', attendance.length);
     console.log('PENDING LEAVES:', leaves.length);

    });

    const context = `You are an HR Assistant for WorkPulse company. 
IMPORTANT: You must ONLY answer using the exact data provided below. 
Do NOT use any outside knowledge. If the answer is not in the data, say "I don't have that information."

=== REAL COMPANY DATA ===

EMPLOYEES (${employees.length} total employees in company):
${employees.map(e => `- ${e.name}: ${e.role}, ${e.department} dept, ${e.experience} years experience, ${e.skills?.length || 0} skills`).join('\n')}

DEPARTMENT BREAKDOWN:
${Object.entries(deptCount).map(([d, c]) => `- ${d}: ${c} employees`).join('\n')}

HIGHEST EXPERIENCE: ${(() => {
  const sorted = [...employees].sort((a, b) => Number(b.experience) - Number(a.experience));
  return `${sorted[0]?.name} with ${sorted[0]?.experience} years, followed by ${sorted[1]?.name} (${sorted[1]?.experience} yrs) and ${sorted[2]?.name} (${sorted[2]?.experience} yrs)`;
})()}

TODAY (${today}) ATTENDANCE:
- Present: ${attendance.length} out of ${employees.length} employees
- Present employees: ${attendance.map(a => a.employee?.name).join(', ') || 'None checked in yet'}
- Absent: ${employees.length - attendance.length} employees

PENDING LEAVE REQUESTS (${leaves.length} pending):
${leaves.length > 0 ? leaves.map(l => `- ${l.employee?.name} (${l.employee?.department}): ${l.leaveType} leave`).join('\n') : '- No pending leaves'}

TASKS NEEDING ATTENTION:
- Overdue tasks: ${overdueTasks.length}
${overdueTasks.length > 0 ? overdueTasks.map(t => `  * "${t.title}" assigned to ${t.assignedTo?.name}`).join('\n') : '  * None'}
- Tasks awaiting approval: ${reviewTasks.length}
${reviewTasks.length > 0 ? reviewTasks.map(t => `  * "${t.title}" assigned to ${t.assignedTo?.name}`).join('\n') : '  * None'}

PROJECTS:
${projects.map(p => `- ${p.name}: ${p.status}`).join('\n') || '- No projects'}

=== END OF COMPANY DATA ===

Now answer this question using ONLY the data above:
"${message}"

Rules:
- Use real names from the data above
- Give specific numbers from the data
- Do not make up any information
- Keep answer under 80 words
- Use bullet points if listing multiple items`;


    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'liquid/lfm-2.5-1.2b-instruct:free',
        messages: [{ role: 'user', content: context }],
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'WorkPulse HR Assistant'
        },
        timeout: 30000
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.log('HR CHAT ERROR:', err.message);
    res.status(500).json({
      message: 'AI assistant is unavailable. Please try again.'
    });
  }
};