const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyzeSkillGap, suggestTeam, summarizeMeeting } = require('../controllers/aiController');

router.post('/skill-gap', auth, analyzeSkillGap);
router.post('/suggest-team', auth, suggestTeam);
router.post('/summarize-meeting', auth, summarizeMeeting);

module.exports = router;