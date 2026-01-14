# Professional Resume Builder

Professional Resume Builder with LaTeX PDF generation and a modern modular architecture.

## Features

- **🛡️ Modular Architecture** - Clean separation of concerns with dedicated managers for Data, UI, Formatting, and Previews.
- **✨ Multiple LaTeX Templates** - Choose from several high-quality professional resume templates.
- **👁️ Live PDF Preview** - Real-time preview with smart debouncing and request deduplication.
- **🛠️ Formatting Controls** - Granular control over fonts, margins, colors, and bullet styles.
- **📄 PDF Export** - High-quality PDF generation using server-side LaTeX compilation.
- **💾 Auto-Save** - Automatically saves your progress to the backend.

## Quick Start

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start the development server
npm start
```

Open `http://localhost:3001` in your browser.

## Technical Architecture

The frontend has been refactored into a modular management system:

- **DataManager**: Handles all CRUD operations on resume data, form collection, and data normalization.
- **UIManager**: Manages interactive elements, sidebar navigation, dynamic sections (Add/Remove), and notification systems.
- **PreviewManager**: Handles the PDF generation lifecycle, including request debouncing, abort controllers for stale requests, and PDF.js integration for rendering.
- **FormattingManager**: Manages visual styles, typography settings, and formatting presets.

## Project Structure

```
ResumeBuilder/
├── backend/app/
│   ├── app.js           # Express server entry point
│   ├── routes/          # API Route definitions
│   └── services/
│       ├── latex.js     # PDF Generation Service
│       └── templates/   # LaTeX Template definitions
├── frontend/
│   ├── views/           # EJS Templates
│   │   ├── pages/       # Main entry pages
│   │   └── partials/    # Modular UI components
│   └── public/
│       ├── css/         # Glassmorphism & Modern UI Styles
│       └── js/
│           ├── resume-builder/  # Modular JS Managers
│           └── resume-simple-fixed.js # Legacy Logic (Deprecated)
└── package.json
```

## Resume Sections Included

- **Profile**: Name, contact details, and custom social/portfolio links.
- **Education**: Schools, degrees, and relevant coursework.
- **Work Experience**: Positions, companies, and achievements.
- **Skills**: Categorized skill keywords.
- **Projects**: Project details, URLs, and descriptions.
- **Awards**: Certifications and professional honors.

## License

MIT
