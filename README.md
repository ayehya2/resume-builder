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
- **Contact Separator Choice** - Choose between bullet (•) or pipe (|) for contact info
- **Inline Website Links** - Portfolio/GitHub links on same line as email/phone
- **Reorganized Sidebar** - Templates first, cleaner navigation
- **Draggable Sections** - Reorder resume sections (coming soon)
- **Bullet Management** - Individual add/remove for each bullet point (coming soon)

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

## 🎨 Resume Formatting

### Current Features
- **Font:** Times New Roman, 11pt
- **Line Spacing:** 1.15 (tight, professional)
- **Padding:** 0.5 inch margins
- **Separator:** User choice of • or |
- **Hyperlinks:** Clickable, blue, underlined
- **Page Size:** Full A4 (8.5" × 11")

### Coming Soon
- **Font Selection** - Arial, Georgia, Calibri, Garamond
- **Color Themes** - Navy, Blue, Green, custom colors
- **Spacing Controls** - Adjust line height, section/paragraph spacing
- **Bullet Styles** - •, ■, ▪, ◆, ▸, -

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
- [x] Contact separator choice (• vs |)
- [x] Inline website links
- [x] Sidebar reorganization
- [ ] Draggable sidebar sections (**IN PROGRESS**)
- [ ] Bullet point management (**IN PROGRESS**)
- [ ] Formatting controls (fonts, colors, spacing)
- [ ] Local storage auto-save
- [ ] JSON export/import
- [ ] Server-side PDF API (Puppeteer)
- [ ] AI-powered bullet suggestions
- [ ] Multi-page resume support
- [ ] More templates (5+ total)
- [ ] Dark mode

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
