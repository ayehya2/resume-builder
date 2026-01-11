# Resume Builder

A standalone resume builder extracted from TalentScope - no authentication required.

## Features

- **Multiple LaTeX Templates** - Professional resume templates
- **Live PDF Preview** - Real-time preview as you type
- **Drag & Drop Sections** - Reorder resume sections
- **Formatting Controls** - Fonts, margins, colors, bullet styles
- **PDF Export** - High-quality PDF generation
- **AI Resume Analysis** - Get feedback on your resume

## Quick Start

```bash
cd ResumeBuilder
npm install
npm start
```

Open `http://localhost:3001` in your browser.

## Project Structure

```
ResumeBuilder/
├── backend/app/
│   ├── app.js           # Express server
│   ├── routes/
│   │   ├── resume.js    # Resume routes
│   │   └── ai.js        # AI features
│   └── services/
│       ├── latex.js     # PDF generation
│       └── templates/   # LaTeX templates
├── frontend/
│   ├── views/pages/
│   │   └── resume-builder.ejs
│   └── public/
│       ├── css/         # Stylesheets
│       ├── js/          # JavaScript
│       └── resume-templates/
└── package.json
```

## Resume Sections

- Profile (name, contact, websites)
- Education
- Work Experience
- Skills
- Projects
- Awards/Certifications

## License

MIT
