# Resume Builder v2

**Professional Resume Builder** - Built with TypeScript, React, and Tailwind CSS

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### Core Functionality
- 📝 **Complete Resume Builder** - Profile, Experience, Education, Skills, Projects, Awards
- 🎨 **4 Professional Templates** - Classic, Modern, Technical, Executive
- 👁️ **Live Preview** - Real-time updates as you type (75% zoom, full A4 page)
- 📥 **PDF Export** - Client-side PDF generation with jsPDF + html2canvas
- ✅ **Auto-Formatting** - Phone numbers `(123) 456-7890`, name capitalization
- 💾 **State Management** - Zustand for predictable, type-safe state
- 🎯 **100% TypeScript** - Full type safety, fewer bugs

### NEW This Session ⭐
- **Extensive Formatting Controls** - Deep typography, spacing, and decorative adjustments.
- **Premium Dark Theme** - Optimized for professional-grade editing in low light.
- **JSON Support** - Export and import your resume data for persistence and sharing.
- **Multi-page Flow** - Fixed PDF wrapping to allow content to span across pages beautifully.
- **Improved UX** - Sidebar folders, draggable sections, and zoom controls.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/ayehya2/resume-builder.git
cd resume-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build      # Creates dist/ folder
npm run preview    # Preview production build
```

---

## 📸 Screenshots

### Main Interface
- **Vertical Sidebar** - Templates, Profile, Experience, Education, Skills, Projects, Awards, Formatting
- **Live Preview** - 700px wide, 75% zoom by default, full A4 page (816x1056px)
- **Form Editor** - Bold labels, dark text, tight spacing for efficiency

### Templates
1. **Classic** - Times New Roman, traditional serif, centered header
2. **Modern** - Blue accents, clean sans-serif, left-aligned
3. **Technical** - Compact, engineering-focused layout
4. **Executive** - Corporate professional style

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18 + TypeScript 5.x |
| **Build Tool** | Vite (⚡ instant HMR) |
| **Styling** | Tailwind CSS v4 |
| **State** | Zustand |
| **Drag & Drop** | @dnd-kit |
| **PDF Export** | jsPDF + html2canvas |
| **Fonts** | Times New Roman (default) |

---

## � Project Structure

```
resume-builder/
├── src/
│   ├── components/          # React components
│   │   ├── BasicsForm.tsx      # Profile info with separator dropdown
│   │   ├── WorkForm.tsx        # Work experience entries
│   │   ├── EducationForm.tsx   # Education entries
│   │   ├── SkillsForm.tsx      # Skills by category
│   │   ├── ProjectsForm.tsx    # Project entries
│   │   ├── AwardsForm.tsx      # Awards & certifications
│   │   ├── FormattingForm.tsx  # Formatting controls (WIP)
│   │   └── BulletList.tsx      # Bullet point management (NEW)
│   ├── templates/           # Resume templates
│   │   ├── ClassicTemplate.tsx     # ✅ Updated
│   │   ├── ModernTemplate.tsx      # ✅ Updated
│   │   ├── TechnicalTemplate.tsx   # ⏳ WIP
│   │   ├── ExecutiveTemplate.tsx   # ⏳ WIP
│   │   └── TemplateRenderer.tsx
│   ├── utils/
│   │   ├── formatters.ts    # Phone, name formatting
│   │   └── styles.ts        # Shared styles
│   ├── App.tsx              # Main app component
│   ├── store.ts             # Zustand store
│   ├── types.ts             # TypeScript types
│   └── index.css            # Global styles + color fixes
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

### Current Features
- **Font Selection** - Arial, Georgia, Calibri, Garamond, Times New Roman, and more.
- **Precise Spacing** - Adjust line height, section gaps, and individual entry spacing.
- **Typography** - Control font weights for names and headers independently.
- **Decorative** - Customizable separators (•, |, ·, —) and header alignment (Left, Center, Right).
- **Icons** - Optional contact icons with adjustable styles (Square/Circle).
- **Page Format** - Toggle between US Letter and A4 standards.

### Roadmap
- **Server-side PDF (Puppeteer)** - Highest quality rendering and font accuracy.
- **AI Suggestions** - Smart bullet point optimization and grammar checking.
- **Rich Text Editor** - Support for bold/italic within bullet points.
- **Academic/Creative Templates** - Specialized layouts for researchers and designers.
- **ATS Scoring** - Compatibility analysis and optimization tips.

---

## � Usage Guide

### 1. Choose Template
Click "Template" in sidebar → Select from 4 options

### 2. Fill Profile Info
- Full Name (auto-capitalizes)
- Email, Phone (auto-formats to `(123) 456-7890`)
- Address
- **Contact Separator** - Choose • or |
- Websites (Portfolio, GitHub, etc.)

### 3. Add Sections
- **Experience** - Company, position, dates, location, description
- **Education** - Institution, degree, field, GPA, graduation date
- **Skills** - Organize by category (Languages, Frameworks, etc.)
- **Projects** - Name, description, technologies
- **Awards** - Title, date, issuer

### 4. Download PDF
Click "📥 Download PDF" - generates `your-name.pdf`

---

## 🔄 State Management

Using **Zustand** for clean, predictable state:

```typescript
interface ResumeStore {
  resumeData: ResumeData;
  updateBasics: (basics: Partial<Basics>) => void;
  addWork: () => void;
  updateWork: (index: number, work: Partial<WorkExperience>) => void;
  // ... more actions
}
```

All components read from and dispatch to the central store.

---

## 🐛 Known Issues & Roadmap

### Known Issues
- **PDF Quality** - Client-side PDF is lower quality than server-side Puppeteer
  - **Fix:** Build Express + Puppeteer API (planned)
- **No Local Storage** - Resume data lost on refresh
  - **Fix:** Auto-save to localStorage (30 min)
- **No Export/Import** - Can't save/load resume JSON
  - **Fix:** Add export/import buttons (30 min)

### Roadmap
- [x] Extensive Formatting controls (Typography, Colors, Spacing)
- [x] Premium Dark Mode
- [x] JSON Export/Import
- [x] Section Reordering (Drag & Drop)
- [x] Multi-page PDF wrapping
- [ ] Server-side PDF API (Express + Puppeteer)
- [ ] AI-powered bullet suggestions
- [ ] ATS compatibility scoring
- [ ] Rich Text/Markdown support in bullets
- [ ] Academic & Creative templates

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## � License

MIT License - see LICENSE file for details

---

## 🛠️ Development

### Commands

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Environment

- **Development:** Vite dev server with HMR
- **Production:** Optimized bundle in `dist/`

### Adding a New Template

1. Create `src/templates/NewTemplate.tsx`
2. Use Times New Roman, 11pt, 1.15 line-height
3. Use `basics.separator` for contact info
4. Add to `TemplateRenderer.tsx`
5. Add to template selector in `App.tsx`

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ayehya2/resume-builder/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ayehya2/resume-builder/discussions)

---

## 📊 Stats

- **Components:** 14
- **Templates:** 4
- **TypeScript:** 100%
- **Lines of Code:** ~2,500+
- **Dependencies:** 12

---

**Built with ❤️ using React + TypeScript**

Last Updated: January 14, 2026
