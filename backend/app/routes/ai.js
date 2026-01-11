const express = require('express');
const router = express.Router();

// AI Resume Analysis - works without authentication
router.post('/api/analyze-resume', async (req, res) => {
    try {
        const { resumeData } = req.body;

        if (!resumeData) {
            return res.status(400).json({
                success: false,
                error: 'Resume data is required for analysis'
            });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            // Return mock analysis if no API key
            return res.json({
                success: true,
                analysis: {
                    overallScore: 75,
                    strengths: [
                        "Resume structure is well organized",
                        "Clear section formatting",
                        "Good skill categorization"
                    ],
                    improvements: [
                        {
                            section: "Work Experience",
                            issue: "Consider adding more quantifiable achievements",
                            suggestion: "Include metrics like percentages or numbers"
                        },
                        {
                            section: "Skills",
                            issue: "Skills could be more specific",
                            suggestion: "Group skills by category (e.g., Programming, Tools, Soft Skills)"
                        }
                    ],
                    keywordSuggestions: [
                        "problem-solving",
                        "team collaboration",
                        "project management"
                    ],
                    careerAdvice: [
                        "Consider adding a professional summary section",
                        "Highlight leadership or mentorship experience",
                        "Include relevant certifications"
                    ],
                    note: "This is a sample analysis. Configure GEMINI_API_KEY for AI-powered analysis."
                }
            });
        }

        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Extract key information from resume
        const basics = resumeData.basics || resumeData.profile || {};
        const work = resumeData.work || resumeData.experience || [];
        const education = resumeData.education || [];
        const skills = resumeData.skills || [];
        const projects = resumeData.projects || [];

        const resumeContext = `
        RESUME TO ANALYZE:
        Name: ${basics.name || 'Not provided'}
        Professional Summary: ${basics.summary || 'Not provided'}
        
        Work Experience:
        ${work.map(job => `- ${job.position || job.title || 'Position'} at ${job.company || job.name || 'Company'} (${job.startDate || 'Date'} - ${job.endDate || 'Present'}): ${job.summary || job.highlights?.join('. ') || job.description || 'No description'}`).join('\n')}
        
        Education:
        ${education.map(edu => `- ${edu.studyType || edu.degree || 'Degree'} in ${edu.area || edu.field || 'Field'} from ${edu.institution || edu.school || 'School'} (${edu.endDate || edu.graduationDate || 'Year'})`).join('\n')}
        
        Skills:
        ${skills.map(skill => skill.name || skill.category || skill).join(', ')}
        
        Projects:
        ${projects.map(proj => `- ${proj.name || proj.title || 'Project'}: ${proj.description || proj.summary || 'No description'}`).join('\n')}
        `;

        const prompt = `
        As an expert career coach and resume analyst, provide a comprehensive analysis of this resume.

        ${resumeContext}

        Please provide your analysis in the following JSON format:
        {
            "overallScore": 85,
            "strengths": [
                "Strong technical skills in relevant technologies",
                "Diverse project experience",
                "Clear career progression"
            ],
            "improvements": [
                {
                    "section": "Professional Summary",
                    "issue": "Too generic and lacks specific achievements",
                    "suggestion": "Add quantifiable achievements and specific technologies"
                }
            ],
            "keywordSuggestions": [
                "cloud computing",
                "agile methodology"
            ],
            "careerAdvice": [
                "Consider obtaining certifications",
                "Highlight leadership experience"
            ]
        }
        
        Respond only with valid JSON, no additional text.
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Clean up markdown formatting if present
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```\s*/, '').replace(/```\s*$/, '');
        }

        const analysis = JSON.parse(responseText);

        res.json({ success: true, analysis });
    } catch (error) {
        console.error('AI Resume analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze resume'
        });
    }
});

module.exports = router;
