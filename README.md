# Resume Builder v2

A modern, professional resume builder built with **TypeScript**, **React**, and **Tailwind CSS**.

## ✨ Features

- 📝 **Complete Resume Builder** - All sections: Profile, Experience, Education, Skills, Projects, Awards
- 🎨 **4 Professional Templates** - Classic, Modern, Technical, Executive
- 👁️ **Live Preview** - See your resume update in real-time as you type
- 📥 **PDF Export** - Download your resume as a high-quality PDF
- 🔄 **Section Reordering** - Drag and drop to rearrange resume sections
- ✅ **Auto-Formatting** - Phone numbers, name capitalization, and more
- 💾 **State Management** - Built with Zustand for reliable state handling
- 🎯 **Type Safety** - 100% TypeScript for fewer bugs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Tech Stack

- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Drag & Drop:** @dnd-kit
- **PDF Generation:** jsPDF + html2canvas
- **Type Safety:** TypeScript 5.x

## 📋 Project Structure

```
src/
├── components/          # React components
│   ├── BasicsForm.tsx   # Profile information form
│   ├── WorkForm.tsx     # Work experience form
│   ├── EducationForm.tsx
│   ├── SkillsForm.tsx
│   ├── ProjectsForm.tsx
│   ├── AwardsForm.tsx
│   ├── SectionReorder.tsx
│   └── FormattingForm.tsx
├── templates/           # Resume templates
│   ├── ClassicTemplate.tsx
│   ├── ModernTemplate.tsx
│   ├── TechnicalTemplate.tsx
│   ├── ExecutiveTemplate.tsx
│   └── TemplateRenderer.tsx
├── utils/               # Utility functions
│   ├── formatters.ts    # Input formatting
│   └── styles.ts        # Shared styles
├── App.tsx              # Main application
├── store.ts             # Zustand state store
├── types.ts             # TypeScript types
└── index.css            # Global styles
```

## 🎨 Templates

1. **Classic** - Traditional serif font, centered layout
2. **Modern** - Blue accents, left-aligned, contemporary
3. **Technical** - Compact, engineering-focused
4. **Executive** - Professional, corporate style

## 🛠️ Features in Detail

### Auto-Formatting
- Phone numbers automatically format to (123) 456-7890
- Names auto-capitalize (john doe → John Doe)
- Input validation on all fields

### Live Preview
- 75% default scale (adjustable with +/- buttons)
- Real-time updates as you type
- Zoom from 40% to 100%
- Scrollable for multi-page resumes

### Section Management
- Drag and drop to reorder sections
- Show/hide sections dynamically
- Customizable section order per template

## 📝 Usage

1. **Click "Load Sample"** to see example data
2. **Fill out your information** in each tab:
   - Profile: Name, contact info, websites
   - Experience: Work history with bullets
   - Education: Degrees and schools
   - Skills: Organized by category
   - Projects: Side projects with tech stacks
   - Awards: Certifications and honors
3. **Choose a template** from 4 professional designs
4. **Reorder sections** via drag-and-drop
5. **Download PDF** when ready!

## 🔜 Upcoming Features

- [ ] More templates
- [ ] Font customization
- [ ] Color theme options
- [ ] Local storage auto-save
- [ ] Export/Import JSON
- [ ] Server-side PDF generation (Puppeteer)
- [ ] Multi-page resume support

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for a seamless user experience.

---

**Made with ❤️ using React + TypeScript**
