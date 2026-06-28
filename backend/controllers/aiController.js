const Employee = require('../models/Employee');
const Skill = require('../models/Skill');


async function callAI(prompt) { 
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'liquid/lfm-2.5-1.2b-instruct:free',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  //console.log('FULL AI RESPONSE:', JSON.stringify(data));
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  if (data.choices && data.choices[0] && data.choices[0].text) {
    return data.choices[0].text;
  }
  throw new Error('Could not parse AI response');
}

exports.analyzeSkillGap = async (req, res) => {
  try {
    const { employeeId, targetRole, targetProjectId } = req.body;
    const employee = await Employee.findById(employeeId);
    const skills = await Skill.find({ employee: employeeId });

    let targetContext = '';
    if (targetProjectId) {
      const Project = require('../models/Project');
      const project = await Project.findById(targetProjectId);
      targetContext = `the project "${project.name}" which requires these skills: ${project.requiredSkills?.join(', ') || 'not specified'}. Project description: ${project.description}`;
    } else {
      targetContext = `the role of ${targetRole}`;
    }

    const skillList = skills.map(s => `${s.name} (${s.category}, ${s.level})`).join(', ') || 'no skills added yet';

    const prompt = `You are an expert HR skill analyst.
Employee: ${employee.name || 'Unknown'}
Current Role: ${employee.role || 'Unknown'}
Department: ${employee.department || 'Unknown'}
Experience: ${employee.experience || 0} years
Current Skills: ${skillList}

Analyze their readiness for ${targetContext}.

Provide:
1. Skill match percentage estimate
2. Skills they already have that match
3. Missing or weak skills they need to develop
4. Specific learning recommendations or courses
5. Overall readiness verdict (Ready / Needs Development / Not Suitable Yet)

Be specific and practical.`;

    const analysis = await callAI(prompt);
    
    res.json({ analysis: analysis });

  } catch (err) {
    console.log('SKILL GAP ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.suggestTeam = async (req, res) => {
  try {
    const { projectDescription, requiredSkills } = req.body;
    const employees = await Employee.find({ status: 'active' }).populate('skills');

    const employeeData = employees.map(e => ({
      name: e.name,
      role: e.role,
      experience: e.experience,
      skills: e.skills.map(s => s.name)
    }));

    const prompt = `You are a project manager.
Project: ${projectDescription}
Required Skills: ${requiredSkills}
Available Employees: ${JSON.stringify(employeeData)}

Suggest the best team. Explain why each person fits.`;

    const suggestion = await callAI(prompt);
    res.json({ suggestion });
  } catch (err) {
    console.log('TEAM ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.summarizeMeeting = async (req, res) => {
  try {
    const { meetingText, meetingTitle } = req.body;

    const prompt = `You are an expert HR meeting analyst.
    
Meeting Title: ${meetingTitle || 'Team Meeting'}
Meeting Notes/Transcript:
${meetingText}

Please analyze this meeting and provide:
1. SUMMARY - Brief 2-3 sentence overview
2. KEY DECISIONS - Important decisions made
3. ACTION ITEMS - Tasks assigned with responsible person if mentioned
4. SKILL REQUIREMENTS - Any skills or training needs identified
5. FOLLOW UP - Next steps and deadlines

Format each section clearly with the section name in capitals followed by the details.`;

    const summary = await callAI(prompt);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};