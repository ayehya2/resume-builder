# Professional Resume Builder

A clean, modular resume builder with high-quality templates and PDF generation.

## ✨ Features

- **🎨 4 High-Quality Templates** - Classic, Modern, Technical, and Executive layouts
- **👁️ Live PDF Preview** - Real-time preview with smart debouncing
- **🛠️ Formatting Controls** - Full control over fonts, margins, colors, and styles
- **📄 Professional PDFs** - High-quality PDF generation using Puppeteer
- **💾 Auto-Save** - Automatically saves your progress
- **🎯 Modular Architecture** - Clean, maintainable codebase ready for scaling

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:3001` in your browser.

## 📐 Templates

| Template | Style | Best For |
|----------|-------|----------|
| **Classic** | Traditional serif | Conservative roles, academia |
| **Modern** | Colorful accents | Creative fields, startups |
| **Technical** | Two-column layout | Software engineers, developers |
| **Executive** | Professional corporate | Business, executive positions |

## 🏗️ Architecture

The project uses a clean modular architecture:

### Frontend
- **DataManager** - Form data collection and normalization
- **UIManager** - Interactive elements and notifications
- **PreviewManager** - PDF preview lifecycle and rendering
- **FormattingManager** - Visual styling and typography

### Backend
- **Express Server** - Lightweight API
- **Puppeteer Engine** - HTML to PDF conversion
- **Template System** - Modular template architecture

## 📁 Project Structure

```
resume-builder/
├── backend/app/
│   ├── app.js              # Express server
│   ├── routes/             # API routes
│   └── services/
│       ├── latex.js        # PDF generation
│       └── templates/      # 4 template modules
├── frontend/
│   ├── views/              # EJS templates
│   └── public/
│       ├── css/            # Modern UI styles
│       └── js/
│           └── resume-builder/  # Modular managers
└── package.json
```

## 📝 Resume Sections

- **Profile** - Name, contact details, social links
- **Education** - Schools, degrees, coursework
- **Work Experience** - Positions, companies, achievements
- **Skills** - Categorized skill keywords
- **Projects** - Project details, URLs, descriptions
- **Awards** - Certifications, honors

## 🎯 Next Steps

This project has been cleaned and is ready for modernization:

1. **TypeScript Migration** - Add type safety
2. **React/TSX** - Component-based architecture
3. **Theme System** - Proper light/dark themes
4. **API Layer** - RESTful API for integration
5. **TalentScope** - Module integration

See `CLEANUP_COMPLETE.md` for details on the recent cleanup.

## 📄 License

MIT
