import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useResumeStore } from './store'
import { BasicsForm } from './components/forms/BasicsForm'
import { WorkForm } from './components/forms/WorkForm'
import { EducationForm } from './components/forms/EducationForm'
import { SkillsForm } from './components/forms/SkillsForm'
import { ProjectsForm } from './components/forms/ProjectsForm'
import { AwardsForm } from './components/forms/AwardsForm'
import { CustomSectionForm } from './components/forms/CustomSectionForm'
import { CoverLetterForm } from './components/forms/CoverLetterForm'
import { AITab } from './components/forms/AITab'
import { FormattingForm } from './components/forms/FormattingForm'
import { LaTeXFormattingForm } from './components/forms/LaTeXFormattingForm'
import { TemplateThumbnail } from './components/preview/TemplateThumbnail'
import { PDFPreview } from './components/preview/PDFPreview'
import type { TemplateId, SectionKey, DocumentType, PreloadedTemplateId } from './types'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import {
  exportToJSON, importFromJSON,
  saveActiveTab, loadActiveTab,
  saveCoverLetterData, loadCoverLetterData, saveDocumentType, loadDocumentType,
  saveContinuousMode, loadContinuousMode, saveShowResume, loadShowResume,
  saveShowCoverLetter, loadShowCoverLetter
} from './lib/storage'
import { loadPrefillData } from './lib/loadFromUrl'
import { parseResumeFile } from './lib/resumeParser'
import { pdf } from '@react-pdf/renderer'
import { getPDFTemplateComponent, isLatexTemplate } from './lib/pdfTemplateMap'
import { compileLatexViaApi } from './lib/latexApiCompiler'
import { generateLaTeXFromData } from './lib/latexGenerator'
import { useCoverLetterStore } from './lib/coverLetterStore'
import { useThemeStore, applyTheme, COLOR_THEMES } from './lib/themeStore'
import { useCustomTemplateStore } from './lib/customTemplateStore'
import { getEffectiveResumeData } from './lib/templateResolver'
import { generateDocumentFileName, generateDocumentTitle } from './lib/documentNaming'
import {
  Plus,
  LayoutTemplate,
  Palette,
  User,
  Briefcase,
  GraduationCap,
  Zap,
  FolderKanban,
  Award,
  ListChecks,
  File,
  Sparkles,
  Download,
  Printer,
  Moon,
  Sun,
  Check,
  Upload,
  FileText,
  RotateCcw,
  FileDown,
  GripVertical,
  ChevronDown,
  Layers,
  FileCheck,
  Mail,
  Pencil,
  Trash2,
  Copy,
  Code2,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import './styles/index.css'

// Lazy-load the LaTeX editor (only needed when LaTeX template is selected)
const LaTeXEditor = lazy(() => import('./components/latex/LaTeXEditor').then(m => ({ default: m.LaTeXEditor })))

// Tab system types
type TabKey = 'basics' | 'work' | 'education' | 'skills' | 'projects' | 'awards' | 'custom-sections' | 'cover-letter' | 'templates' | 'formatting' | 'ai' | string;

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  draggable?: boolean;
  sectionKey?: SectionKey;
}

const templates: Array<{ id: TemplateId; name: string; isLatex?: boolean; description?: string }> = [
  { id: 1, name: 'Classic' },
  { id: 2, name: 'Modern' },
  { id: 3, name: 'Minimal' },
  { id: 4, name: 'Executive' },
  { id: 5, name: 'Creative' },
  { id: 6, name: 'Technical' },
  { id: 7, name: 'Elegant' },
  { id: 8, name: 'Compact' },
  { id: 9, name: 'Academic' },
  { id: 11, name: 'Professional LaTeX', isLatex: true, description: 'Standard pdfTeX resume' },
  { id: 12, name: 'Compact LaTeX', isLatex: true, description: '10pt, tight spacing' },
  { id: 13, name: 'Ultra Compact LaTeX', isLatex: true, description: '9pt, max density' },
  { id: 14, name: 'Academic LaTeX', isLatex: true, description: 'Academic CV style' },
];

function SidebarItem({ tab, isActive, onClick }: { tab: TabItem; isActive: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.key,
    disabled: !tab.draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={{ ...style, ...(isActive ? { backgroundColor: 'var(--sidebar-hover)' } : {}) }}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 font-semibold transition-all border-l-4 cursor-pointer
        ${isActive
          ? 'border-white'
          : 'border-transparent'
        }
      `}
    >
      {tab.draggable && (
        <span {...attributes} {...listeners} className="cursor-move text-white/40 hover:text-white">
          <GripVertical size={16} />
        </span>
      )}
      <span className="!text-white">{tab.icon}</span>
      <span className="text-sm !text-white">{tab.label}</span>
    </button>
  );
}

function App() {
  const {
    resumeData,
    setTemplate,
    setSections,
    loadSampleData,
    reset,
    addCustomSection,
    updateFormatting
  } = useResumeStore();
  const { coverLetterData } = useCoverLetterStore()
  const { customTemplates, addCustomTemplate, updateCustomTemplate, deleteCustomTemplate } = useCustomTemplateStore()
  const [activeTab, setActiveTab] = useState<TabKey>(() => loadActiveTab() as TabKey)
  const { colorThemeId, isDark: darkMode, setColorTheme, toggleDark } = useThemeStore()
  const [documentType, setDocumentType] = useState<DocumentType>('resume')

  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<'all' | 'standard' | 'latex'>('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateSort, setTemplateSort] = useState<'default' | 'latex-first' | 'standard-first'>('default');
  const [templatePage, setTemplatePage] = useState(1);
  const [templatesPerPage, setTemplatesPerPage] = useState(10);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // New state for sidebar controls
  const [continuousMode, setContinuousMode] = useState(() => loadContinuousMode());
  const [showResume, setShowResume] = useState(() => loadShowResume());
  const [showCoverLetter, setShowCoverLetter] = useState(() => loadShowCoverLetter());
  const [isImporting, setIsImporting] = useState(false);

  // Custom template creation state
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateBase, setNewTemplateBase] = useState<PreloadedTemplateId>(1);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState('');

  // Scroll to a section in continuous mode instead of switching tabs
  const scrollToContinuousSection = (tabKey: TabKey) => {
    const sectionId = `continuous-section-${tabKey}`;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle sidebar tab click — scroll if continuous mode, else switch tab
  const handleSidebarClick = (tabKey: TabKey) => {
    if (continuousMode) {
      scrollToContinuousSection(tabKey);
    } else {
      setActiveTab(tabKey);
    }
  };

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load non-store persisted data on mount; resume store is auto-persisted via Zustand middleware
  useEffect(() => {
    const savedCoverLetter = loadCoverLetterData();
    if (savedCoverLetter) {
      useCoverLetterStore.setState({ coverLetterData: savedCoverLetter });
    }

    const savedType = loadDocumentType();
    if (savedType) {
      setDocumentType(savedType);
    }

    // Prefill data overrides localStorage — must run AFTER the above
    loadPrefillData();
  }, []);

  // Save active tab on change
  useEffect(() => {
    saveActiveTab(activeTab);
  }, [activeTab]);

  // Apply theme + dark mode CSS custom properties whenever either changes
  useEffect(() => {
    applyTheme(colorThemeId, darkMode);
  }, [colorThemeId, darkMode]);

  // Persist new settings
  useEffect(() => { saveContinuousMode(continuousMode); }, [continuousMode]);
  useEffect(() => { saveShowResume(showResume); }, [showResume]);
  useEffect(() => { saveShowCoverLetter(showCoverLetter); }, [showCoverLetter]);

  // Auto-save cover letter & document type every 30 seconds (resume store auto-persists via Zustand middleware)
  useEffect(() => {
    const interval = setInterval(() => {
      saveCoverLetterData(coverLetterData);
      saveDocumentType(documentType);
    }, 30000);
    return () => clearInterval(interval);
  }, [coverLetterData, documentType]);

  // Sync documentType with toggles and activeTab
  useEffect(() => {
    if (showCoverLetter && !showResume) {
      setDocumentType('coverletter');
    } else if (activeTab === 'cover-letter') {
      setDocumentType('coverletter');
    } else {
      setDocumentType('resume');
    }
  }, [activeTab, showResume, showCoverLetter]);

  // If the current tab becomes hidden, switch to the first visible tab
  useEffect(() => {
    if (!showResume && activeTab !== 'cover-letter' && activeTab !== 'templates' && activeTab !== 'formatting' && activeTab !== 'ai') {
      if (showCoverLetter) {
        setActiveTab('cover-letter');
      } else {
        setActiveTab('templates');
      }
    }
    if (!showCoverLetter && activeTab === 'cover-letter') {
      if (showResume) {
        setActiveTab('basics');
      } else {
        setActiveTab('templates');
      }
    }
  }, [showResume, showCoverLetter]);

  // Toggle dark mode — independent of color theme
  const toggleDarkMode = () => {
    toggleDark();
  };

  // Handle resume/cover letter toggle with "at least one" constraint
  const handleToggleResume = () => {
    if (showResume && !showCoverLetter) return; // Can't uncheck both
    setShowResume(!showResume);
  };

  const handleToggleCoverLetter = () => {
    if (showCoverLetter && !showResume) return; // Can't uncheck both
    setShowCoverLetter(!showCoverLetter);
  };

  // Export JSON
  const handleExport = () => {
    const json = exportToJSON(resumeData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${resumeData.basics.name || 'data'}.json`.replace(/[^a-z0-9._-]/gi, '_');
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export .tex source
  const handleDownloadTex = () => {
    const effectiveData = getEffectiveResumeData(resumeData, customTemplates);
    const { customLatexSource } = useResumeStore.getState();
    const { latexFormatting } = useResumeStore.getState();
    const texSource = customLatexSource || generateLaTeXFromData(effectiveData, resumeData.selectedTemplate, latexFormatting);
    const blob = new Blob([texSource], { type: 'application/x-latex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = resumeData.basics.name || 'resume';
    a.download = `${name.replace(/[^a-z0-9._-]/gi, '_')}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import — supports JSON, PDF, DOCX, LaTeX, TXT
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.pdf,.docx,.doc,.tex,.latex,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsImporting(true);

      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';

        if (ext === 'json') {
          // Full-fidelity JSON import
          const text = await file.text();
          const data = importFromJSON(text);
          useResumeStore.setState({ resumeData: data });
          alert('Resume data imported successfully from JSON!');
        } else {
          // Parse other formats
          const parsed = await parseResumeFile(file);

          // Merge parsed data into current resume
          const current = useResumeStore.getState().resumeData;

          // Merge websites
          const existingUrls = new Set(current.basics.websites.map(w => w.url));
          const newWebsites = parsed.basics?.websites?.filter(w => !existingUrls.has(w.url)) || [];

          useResumeStore.setState({
            resumeData: {
              ...current,
              basics: {
                ...current.basics,
                ...parsed.basics,
                websites: [...current.basics.websites, ...newWebsites]
              },
              work: parsed.work && parsed.work.length > 0 ? parsed.work : current.work,
              education: parsed.education && parsed.education.length > 0 ? parsed.education : current.education,
              skills: parsed.skills && parsed.skills.length > 0 ? parsed.skills : current.skills,
              projects: parsed.projects && parsed.projects.length > 0 ? parsed.projects : current.projects,
              awards: parsed.awards && parsed.awards.length > 0 ? parsed.awards : current.awards,
            }
          });
          alert(`Resume data imported from ${ext.toUpperCase()} file! Please review and adjust the parsed content.`);
        }
      } catch (error) {
        console.error('Import error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to import file: ${msg}`);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  // Map sections to tabs dynamically
  const sectionTabs: TabItem[] = resumeData.sections.map(sectionKey => {
    const tabMap: Record<string, TabItem> = {
      profile: { key: 'basics', label: 'Profile', icon: <User size={18} />, draggable: false },
      work: { key: 'work', label: 'Experience', icon: <Briefcase size={18} />, draggable: true, sectionKey: 'work' },
      education: { key: 'education', label: 'Education', icon: <GraduationCap size={18} />, draggable: true, sectionKey: 'education' },
      skills: { key: 'skills', label: 'Skills', icon: <Zap size={18} />, draggable: true, sectionKey: 'skills' },
      projects: { key: 'projects', label: 'Projects', icon: <FolderKanban size={18} />, draggable: true, sectionKey: 'projects' },
      awards: { key: 'awards', label: 'Awards', icon: <Award size={18} />, draggable: true, sectionKey: 'awards' },
    };

    // Check if it's a custom section
    if (!tabMap[sectionKey]) {
      const customSection = resumeData.customSections.find(cs => cs.id === sectionKey);
      if (customSection) {
        return {
          key: customSection.id,
          label: customSection.title,
          icon: <ListChecks size={18} />,
          draggable: true,
          sectionKey: customSection.id,
        };
      }
    }

    return tabMap[sectionKey];
  }).filter(Boolean);

  // Flat tab list
  const isLatexSelected = isLatexTemplate(resumeData.selectedTemplate);

  // Filtered, searched, sorted templates
  const filteredTemplates = (() => {
    let result = templateFilter === 'all'
      ? [...templates]
      : templateFilter === 'latex'
        ? templates.filter(t => t.isLatex)
        : templates.filter(t => !t.isLatex);

    // Search filter
    if (templateSearch.trim()) {
      const q = templateSearch.trim().toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.isLatex && 'latex pdftex'.includes(q)) ||
        (!t.isLatex && 'standard react pdf'.includes(q))
      );
    }

    // Sort
    if (templateSort === 'latex-first') {
      result.sort((a, b) => (a.isLatex === b.isLatex ? 0 : a.isLatex ? -1 : 1));
    } else if (templateSort === 'standard-first') {
      result.sort((a, b) => (a.isLatex === b.isLatex ? 0 : a.isLatex ? 1 : -1));
    }

    return result;
  })();

  // Pagination
  const totalTemplatePages = Math.ceil(filteredTemplates.length / templatesPerPage);
  const paginatedTemplates = filteredTemplates.length > 10
    ? filteredTemplates.slice((templatePage - 1) * templatesPerPage, templatePage * templatesPerPage)
    : filteredTemplates;

  // Reset page when filter/search/sort/perPage changes
  useEffect(() => {
    setTemplatePage(1);
  }, [templateFilter, templateSearch, templateSort, templatesPerPage]);

  // Per-page options: always show 10, show 20 if total >= 20, show 50 if total >= 50
  const perPageOptions = [10, ...(filteredTemplates.length >= 20 ? [20] : []), ...(filteredTemplates.length >= 50 ? [50] : [])];

  // Template filter bar JSX (reused in both modes)
  const templateFilterBar = (
    <div className="space-y-3 mb-4">
      {/* Search bar */}
      <div className="relative">
        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        <input
          type="text"
          value={templateSearch}
          onChange={(e) => setTemplateSearch(e.target.value)}
          placeholder="Search templates..."
          className={`w-full pl-9 pr-3 py-2 text-sm border-2 transition-colors ${darkMode
            ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-slate-400'
            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500'
            } outline-none`}
        />
      </div>
      {/* Filter + Sort row */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'latex', 'standard'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setTemplateFilter(filter)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors border-2 ${templateFilter === filter
              ? (darkMode ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 text-white border-slate-800')
              : (darkMode ? 'bg-transparent text-slate-400 border-slate-600 hover:text-white hover:border-slate-500' : 'bg-transparent text-slate-500 border-slate-300 hover:text-slate-800 hover:border-slate-400')
              }`}
          >
            {filter === 'all' ? 'All' : filter === 'latex' ? 'LaTeX' : 'Standard'}
          </button>
        ))}
        <div className="flex-1" />
        {/* Sort dropdown */}
        <select
          value={templateSort}
          onChange={(e) => setTemplateSort(e.target.value as typeof templateSort)}
          className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 outline-none cursor-pointer transition-colors ${darkMode
            ? 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
            : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
            }`}
        >
          <option value="default">Default Order</option>
          <option value="latex-first">LaTeX First</option>
          <option value="standard-first">Standard First</option>
        </select>
      </div>
      {/* Count */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          {templateSearch.trim() && ' found'}
        </span>
      </div>
    </div>
  );

  // Pagination controls JSX (reused in both modes)
  const templatePaginationControls = filteredTemplates.length > 10 ? (
    <div className={`flex items-center justify-between mt-4 pt-4 border-t-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Per page:
        </span>
        {perPageOptions.map(n => (
          <button
            key={n}
            onClick={() => setTemplatesPerPage(n)}
            className={`px-2 py-1 text-[10px] font-bold border-2 transition-colors ${templatesPerPage === n
              ? (darkMode ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 text-white border-slate-800')
              : (darkMode ? 'bg-transparent text-slate-400 border-slate-600 hover:text-white' : 'bg-transparent text-slate-500 border-slate-300 hover:text-slate-800')
              }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTemplatePage(p => Math.max(1, p - 1))}
          disabled={templatePage <= 1}
          className={`p-1 border-2 transition-colors ${templatePage <= 1
            ? (darkMode ? 'border-slate-700 text-slate-700 cursor-not-allowed' : 'border-slate-200 text-slate-300 cursor-not-allowed')
            : (darkMode ? 'border-slate-600 text-slate-300 hover:text-white hover:border-slate-500' : 'border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400')
            }`}
        >
          <ChevronLeft size={14} />
        </button>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {templatePage} / {totalTemplatePages}
        </span>
        <button
          onClick={() => setTemplatePage(p => Math.min(totalTemplatePages, p + 1))}
          disabled={templatePage >= totalTemplatePages}
          className={`p-1 border-2 transition-colors ${templatePage >= totalTemplatePages
            ? (darkMode ? 'border-slate-700 text-slate-700 cursor-not-allowed' : 'border-slate-200 text-slate-300 cursor-not-allowed')
            : (darkMode ? 'border-slate-600 text-slate-300 hover:text-white hover:border-slate-500' : 'border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400')
            }`}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  ) : null;

  const primarySettings: TabItem[] = [
    { key: 'templates', label: 'Template', icon: <LayoutTemplate size={18} />, draggable: false },
    { key: 'formatting', label: isLatexSelected ? 'LaTeX Formatting' : 'Formatting', icon: <Palette size={18} />, draggable: false },
  ];

  const secondarySettings: TabItem[] = [
    ...(isLatexTemplate(resumeData.selectedTemplate) ? [{ key: 'latex-editor' as TabKey, label: 'LaTeX Editor', icon: <Code2 size={18} />, draggable: false }] : []),
    ...(showCoverLetter ? [{ key: 'cover-letter' as TabKey, label: 'Cover Letter', icon: <File size={18} />, draggable: false }] : []),
    { key: 'ai', label: 'AI Assistant', icon: <Sparkles size={18} />, draggable: false },
  ];

  const allTabs = [...primarySettings, ...sectionTabs, ...secondarySettings];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Convert tab keys back to section keys
    const activeSection = active.id === 'basics' ? 'profile' : (active.id as SectionKey);
    const overSection = over.id === 'basics' ? 'profile' : (over.id as SectionKey);

    const oldIndex = resumeData.sections.indexOf(activeSection);
    const newIndex = resumeData.sections.indexOf(overSection);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Profile must always stay at top
      if (activeSection === 'profile' || overSection === 'profile') return;

      const newSections = arrayMove(resumeData.sections, oldIndex, newIndex);
      // Aggressive uniqueness check before setting
      const uniqueSections = Array.from(new Set(newSections));
      setSections(uniqueSections);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const effectiveData = getEffectiveResumeData(resumeData, customTemplates);
      const namingInput = {
        userName: resumeData.basics.name || '',
        documentType,
        jobTitle: documentType === 'coverletter' ? coverLetterData.position : undefined,
      };
      const fileName = generateDocumentFileName(namingInput);
      const docTitle = generateDocumentTitle(namingInput);

      let blob: Blob;

      if (isLatexTemplate(resumeData.selectedTemplate) && documentType !== 'coverletter') {
        // Real LaTeX compilation only
        const { customLatexSource, latexFormatting: lf } = useResumeStore.getState();
        const texSource = customLatexSource || generateLaTeXFromData(effectiveData, resumeData.selectedTemplate, lf);
        blob = await compileLatexViaApi(texSource);
      } else {
        const templateComponent = getPDFTemplateComponent(effectiveData, documentType, coverLetterData, docTitle);
        blob = await pdf(templateComponent as any).toBlob();
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(isLatexTemplate(resumeData.selectedTemplate)
        ? 'LaTeX compilation failed. Check your LaTeX source or try again.'
        : 'PDF generation failed. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const effectiveData = getEffectiveResumeData(resumeData, customTemplates);
      const docTitle = generateDocumentTitle({
        userName: resumeData.basics.name || '',
        documentType,
        jobTitle: documentType === 'coverletter' ? coverLetterData.position : undefined,
      });

      let blob: Blob;

      if (isLatexTemplate(resumeData.selectedTemplate) && documentType !== 'coverletter') {
        const { customLatexSource, latexFormatting: lf } = useResumeStore.getState();
        const texSource = customLatexSource || generateLaTeXFromData(effectiveData, resumeData.selectedTemplate, lf);
        blob = await compileLatexViaApi(texSource);
      } else {
        const templateComponent = getPDFTemplateComponent(effectiveData, documentType, coverLetterData, docTitle);
        blob = await pdf(templateComponent as any).toBlob();
      }

      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Print generation error:', error);
      alert(isLatexTemplate(resumeData.selectedTemplate)
        ? 'LaTeX compilation failed. Check your LaTeX source or try again.'
        : 'Print generation failed. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  // Render all forms stacked (continuous mode)
  const renderContinuousMode = () => {
    const sections: React.ReactNode[] = [];
    const dividerClass = `pb-8 mb-8 border-b-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`;

    // Template selector
    sections.push(
      <div key="templates" id="continuous-section-templates" className={dividerClass}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Choose Template</h3>
        {templateFilterBar}
        <div className="grid grid-cols-2 gap-4">
          {paginatedTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setTemplate(template.id)}
              className={`
                group relative flex flex-col overflow-hidden border-2 transition-all
                ${resumeData.selectedTemplate === template.id
                  ? 'border-slate-800 ring-2 ring-slate-600/20'
                  : darkMode
                    ? 'border-slate-700 bg-slate-800 hover:border-slate-500'
                    : 'border-slate-300 bg-slate-100 hover:border-slate-400'
                }
              `}
            >
              <div className="aspect-[3/4] overflow-hidden bg-white pdf-paper border-b-2 border-slate-200 dark:border-slate-800 relative">
                <TemplateThumbnail templateId={template.id} />
                {resumeData.selectedTemplate === template.id && (
                  <div className="absolute inset-0 border-4 border-slate-900/40 pointer-events-none"></div>
                )}
                {template.isLatex && (
                  <div className="absolute top-2 right-2 bg-slate-800 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg z-10">
                    pdfTeX
                  </div>
                )}
              </div>
              <div className={`
                p-3 text-left transition-colors relative
                ${resumeData.selectedTemplate === template.id
                  ? (darkMode ? 'bg-slate-900 border-t border-slate-700' : 'bg-white border-t border-slate-100')
                  : (darkMode ? 'bg-slate-800/50' : 'bg-slate-50')
                }
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-sm leading-tight ${resumeData.selectedTemplate === template.id
                      ? (darkMode ? 'text-white' : 'text-slate-900')
                      : (darkMode ? 'text-slate-400' : 'text-slate-500')
                      }`}>
                      {template.name}
                    </div>
                    <div className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${resumeData.selectedTemplate === template.id
                      ? (darkMode ? 'text-accent-light' : 'text-accent')
                      : (darkMode ? 'text-slate-500' : 'text-slate-400')
                      }`}>
                      {template.description || (template.isLatex ? 'pdfTeX' : 'React PDF')}
                    </div>
                  </div>
                  {resumeData.selectedTemplate === template.id && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-white" style={{ backgroundColor: 'var(--accent)' }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        {templatePaginationControls}

        {/* ── My Templates (Continuous Mode) ── */}
        <div className={`border-t-2 pt-6 mt-6 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Templates</h3>
            <button
              onClick={() => setShowCreateTemplate(!showCreateTemplate)}
              className="btn-accent flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded"
            >
              <Plus size={14} />
              <span>New Template</span>
            </button>
          </div>

          {/* Create template form */}
          {showCreateTemplate && (
            <div className={`mb-4 p-4 border-2 ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'}`}>
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g. Software Engineer v1"
                    className={`w-full px-3 py-2 text-sm rounded border-2 ${darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Base Template
                  </label>
                  <select
                    value={newTemplateBase}
                    onChange={(e) => setNewTemplateBase(Number(e.target.value) as PreloadedTemplateId)}
                    className={`w-full px-3 py-2 text-sm rounded border-2 ${darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                      }`}
                  >
                    {templates.filter(t => !t.isLatex).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!newTemplateName.trim()) return;
                      const newId = addCustomTemplate(newTemplateName.trim(), newTemplateBase, resumeData.formatting);
                      setTemplate(newId);
                      setNewTemplateName('');
                      setShowCreateTemplate(false);
                    }}
                    disabled={!newTemplateName.trim()}
                    className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${!newTemplateName.trim()
                      ? 'bg-slate-500 text-slate-300 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setShowCreateTemplate(false); setNewTemplateName(''); }}
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom templates grid */}
          {customTemplates.length === 0 && !showCreateTemplate ? (
            <div className={`text-center py-8 border-2 border-dashed ${darkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
              <LayoutTemplate size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No custom templates yet</p>
              <p className="text-xs mt-1">Click "New Template" to create one with your own formatting</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {customTemplates.map((ct) => {
                const baseName = templates.find(t => t.id === ct.baseTemplateId)?.name || 'Classic';
                const isActive = resumeData.selectedTemplate === ct.id;
                const isEditing = editingTemplateId === ct.id;

                return (
                  <div
                    key={ct.id}
                    className={`
                      group relative flex flex-col overflow-hidden border-2 transition-all cursor-pointer
                      ${isActive
                        ? 'border-blue-500 ring-2 ring-blue-400/20'
                        : darkMode
                          ? 'border-slate-700 bg-slate-800 hover:border-slate-500'
                          : 'border-slate-300 bg-slate-100 hover:border-slate-400'
                      }
                    `}
                  >
                    <button
                      onClick={() => {
                        setTemplate(ct.id);
                        updateFormatting(ct.formatting);
                      }}
                      className="aspect-[3/4] overflow-hidden bg-white pdf-paper border-b-2 border-slate-200 dark:border-slate-800 w-full"
                    >
                      <TemplateThumbnail templateId={ct.baseTemplateId} />
                      {isActive && (
                        <div className="absolute inset-0 border-4 border-blue-500/30 pointer-events-none"></div>
                      )}
                    </button>

                    <div className={`p-3 text-left transition-colors relative ${isActive
                      ? (darkMode ? 'bg-slate-900 border-t border-blue-800' : 'bg-blue-50 border-t border-blue-100')
                      : (darkMode ? 'bg-slate-800/50' : 'bg-slate-50')
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTemplateName}
                              onChange={(e) => setEditingTemplateName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && editingTemplateName.trim()) {
                                  updateCustomTemplate(ct.id, { name: editingTemplateName.trim() });
                                  setEditingTemplateId(null);
                                }
                                if (e.key === 'Escape') setEditingTemplateId(null);
                              }}
                              onBlur={() => {
                                if (editingTemplateName.trim()) {
                                  updateCustomTemplate(ct.id, { name: editingTemplateName.trim() });
                                }
                                setEditingTemplateId(null);
                              }}
                              autoFocus
                              className={`w-full px-1.5 py-0.5 text-sm font-bold rounded border ${darkMode ? 'bg-slate-700 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                            />
                          ) : (
                            <div className={`font-bold text-sm leading-tight truncate ${isActive ? (darkMode ? 'text-white' : 'text-slate-900') : (darkMode ? 'text-slate-300' : 'text-slate-600')
                              }`}>
                              {ct.name}
                            </div>
                          )}
                          <div className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${isActive ? (darkMode ? 'text-accent-light' : 'text-accent') : (darkMode ? 'text-slate-500' : 'text-slate-400')
                            }`}>
                            Based on {baseName}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isActive && (
                            <div className="text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--accent)' }}>
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingTemplateId(ct.id); setEditingTemplateName(ct.name); }}
                            title="Rename"
                            className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                              }`}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newId = addCustomTemplate(`${ct.name} (Copy)`, ct.baseTemplateId, ct.formatting);
                              setTemplate(newId);
                              updateFormatting(ct.formatting);
                            }}
                            title="Duplicate"
                            className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                              }`}
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${ct.name}"?`)) {
                                deleteCustomTemplate(ct.id);
                                if (resumeData.selectedTemplate === ct.id) setTemplate(1);
                              }
                            }}
                            title="Delete"
                            className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'
                              }`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );

    // Formatting options
    sections.push(
      <div key="formatting" id="continuous-section-formatting" className={dividerClass}>
        {isLatexSelected ? <LaTeXFormattingForm /> : <FormattingForm />}
      </div>
    );

    if (showResume) {
      sections.push(
        <div key="basics" id="continuous-section-basics" className={dividerClass}>
          <BasicsForm />
        </div>
      );

      // Render section tabs in order (respects drag-and-drop ordering)
      for (const sKey of resumeData.sections) {
        if (sKey === 'profile') continue; // Already rendered basics

        if (sKey === 'work') {
          sections.push(<div key="work" id="continuous-section-work" className={dividerClass}><WorkForm /></div>);
        } else if (sKey === 'education') {
          sections.push(<div key="education" id="continuous-section-education" className={dividerClass}><EducationForm /></div>);
        } else if (sKey === 'skills') {
          sections.push(<div key="skills" id="continuous-section-skills" className={dividerClass}><SkillsForm /></div>);
        } else if (sKey === 'projects') {
          sections.push(<div key="projects" id="continuous-section-projects" className={dividerClass}><ProjectsForm /></div>);
        } else if (sKey === 'awards') {
          sections.push(<div key="awards" id="continuous-section-awards" className={dividerClass}><AwardsForm /></div>);
        } else {
          // Custom section — always render if found
          const cs = resumeData.customSections.find(c => c.id === sKey);
          if (cs) {
            sections.push(<div key={sKey} id={`continuous-section-${sKey}`} className={dividerClass}><CustomSectionForm sectionId={sKey} /></div>);
          }
        }
      }
    }

    if (showCoverLetter) {
      sections.push(
        <div key="cover-letter" id="continuous-section-cover-letter" className={dividerClass}>
          <CoverLetterForm />
        </div>
      );
    }

    // LaTeX Editor (if LaTeX template is selected)
    if (isLatexTemplate(resumeData.selectedTemplate)) {
      sections.push(
        <div key="latex-editor" id="continuous-section-latex-editor" className={dividerClass}>
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          }>
            <LaTeXEditor />
          </Suspense>
        </div>
      );
    }

    // AI Assistant at the end
    sections.push(
      <div key="ai" id="continuous-section-ai" className={dividerClass}>
        <AITab documentType={documentType} />
      </div>
    );

    return sections;
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <div className="flex-1 flex w-full">
        <aside className="w-56 flex-shrink-0 border-r-2" style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', borderColor: 'var(--sidebar-border)' }}>
          <div className="sticky top-0 h-screen flex flex-col">
            {/* Document Type Toggles */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Document Type</div>
              <label className="flex items-center gap-2.5 cursor-pointer mb-2 group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showResume}
                    onChange={handleToggleResume}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all ${!showResume ? 'border-white/40 group-hover:border-white/60' : ''}`}
                    style={showResume ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}
                  >
                    {showResume && <Check size={10} strokeWidth={3} className="text-white" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck size={14} className="text-white/70" />
                  <span className="text-sm font-semibold text-white/90">Resume</span>
                </div>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showCoverLetter}
                    onChange={handleToggleCoverLetter}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all ${!showCoverLetter ? 'border-white/40 group-hover:border-white/60' : ''}`}
                    style={showCoverLetter ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}
                  >
                    {showCoverLetter && <Check size={10} strokeWidth={3} className="text-white" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-white/70" />
                  <span className="text-sm font-semibold text-white/90">Cover Letter</span>
                </div>
              </label>
            </div>

            {/* Continuous Page Toggle */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={continuousMode}
                    onChange={() => setContinuousMode(!continuousMode)}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-all ${!continuousMode ? 'bg-slate-500 group-hover:bg-slate-400' : ''}`}
                    style={continuousMode ? { backgroundColor: 'var(--accent)' } : undefined}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform absolute top-[3px] ${continuousMode ? 'translate-x-[18px]' : 'translate-x-[3px]'
                      }`} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-white/70" />
                  <span className="text-xs font-semibold text-white/90">Continuous Page</span>
                </div>
              </label>
            </div>

            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto">
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={allTabs.map(t => t.key)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col">
                    {/* Primary Settings */}
                    {primarySettings.map((tab) => (
                      <SidebarItem
                        key={tab.key}
                        tab={tab}
                        isActive={activeTab === tab.key && !continuousMode}
                        onClick={() => handleSidebarClick(tab.key)}
                      />
                    ))}

                    {/* Sortable Sections (only if resume is enabled) */}
                    {showResume && sectionTabs.map((tab) => (
                      <SidebarItem
                        key={tab.key}
                        tab={tab}
                        isActive={activeTab === tab.key && !continuousMode}
                        onClick={() => handleSidebarClick(tab.key)}
                      />
                    ))}

                    {/* Add Custom Section Button (only if resume is enabled) */}
                    {showResume && (
                      <button
                        onClick={() => {
                          const newId = addCustomSection();
                          if (!continuousMode) {
                            setActiveTab(newId);
                          }
                          // In continuous mode, the new section appears automatically
                          // via the reactive resumeData.sections loop
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 !text-white hover:bg-slate-900/40 transition-colors border-l-4 border-transparent"
                      >
                        <Plus size={16} />
                        <span className="text-sm font-semibold !text-white">Add Custom Section</span>
                      </button>
                    )}

                    {/* Secondary Settings */}
                    {secondarySettings.map((tab) => (
                      <SidebarItem
                        key={tab.key}
                        tab={tab}
                        isActive={activeTab === tab.key && !continuousMode}
                        onClick={() => handleSidebarClick(tab.key)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Bottom Controls: Export, Import, Sample, Theme, Reset */}
            <div className="border-t p-3 space-y-2" style={{ borderColor: 'var(--sidebar-border)' }}>
              {/* Export button */}
              <div ref={exportDropdownRef} className="relative">
                <button
                  onClick={() => setExportDropdownOpen(prev => !prev)}
                  disabled={isGeneratingPDF || isPrinting}
                  className={`w-full flex items-center justify-center gap-2 px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors rounded bg-teal-700 hover:bg-teal-600 text-white ${(isGeneratingPDF || isPrinting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FileDown size={14} />
                  <span>{isGeneratingPDF ? 'Generating...' : isPrinting ? 'Preparing...' : 'Export'}</span>
                  <ChevronDown size={10} className={`transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {exportDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-1 w-full shadow-xl border-2 z-50 overflow-hidden bg-slate-700 border-slate-600">
                    <button
                      onClick={() => { setExportDropdownOpen(false); handleDownloadPDF(); }}
                      disabled={isGeneratingPDF}
                      className={`w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors text-white hover:bg-slate-600 ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FileDown size={12} className="text-teal-400" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => { setExportDropdownOpen(false); handlePrint(); }}
                      disabled={isPrinting}
                      className={`w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors text-white hover:bg-slate-600 ${isPrinting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Printer size={12} className="text-blue-400" />
                      Print / Preview
                    </button>
                    {isLatexSelected && (
                      <>
                        <div className="border-t border-slate-600" />
                        <button
                          onClick={() => { setExportDropdownOpen(false); handleDownloadTex(); }}
                          className="w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors text-white hover:bg-slate-600"
                        >
                          <Code2 size={12} className="text-emerald-400" />
                          Download .tex
                        </button>
                      </>
                    )}
                    <div className="border-t border-slate-600" />
                    <button
                      onClick={() => { setExportDropdownOpen(false); handleExport(); }}
                      className="w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors text-white hover:bg-slate-600"
                    >
                      <Download size={12} className="text-amber-400" />
                      Export JSON
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors rounded ${isImporting ? 'opacity-50 cursor-not-allowed' : ''
                    } ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-500 hover:bg-slate-400 text-white'}`}
                >
                  <Upload size={12} />
                  <span>{isImporting ? 'Importing...' : 'Import'}</span>
                </button>
                <button
                  onClick={loadSampleData}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors rounded ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-500 hover:bg-slate-400 text-white'
                    }`}
                >
                  <FileText size={12} />
                  <span>Sample</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={toggleDarkMode}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors rounded ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-500 hover:bg-slate-400 text-white'
                    }`}
                >
                  {darkMode ? <Sun size={12} /> : <Moon size={12} />}
                  <span>{darkMode ? 'Light' : 'Dark'}</span>
                </button>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors rounded bg-red-700 hover:bg-red-800 text-white"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
              {/* Color Theme Picker */}
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
                <span className="block text-[9px] font-bold uppercase tracking-widest mb-2 opacity-50">
                  Color Theme
                </span>
                <div className="grid grid-cols-10 gap-1">
                  {COLOR_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setColorTheme(theme.id)}
                      title={theme.name}
                      className={`relative w-full aspect-square transition-transform hover:scale-110 ${colorThemeId === theme.id ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' : ''}`}
                      style={{ backgroundColor: theme.swatch, borderRadius: 3 }}
                    >
                      {colorThemeId === theme.id && (
                        <Check size={9} className="absolute inset-0 m-auto text-white drop-shadow-md" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className={`flex-1 p-6 overflow-y-auto ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
          <div className="w-full max-w-5xl mx-auto">
            {continuousMode ? (
              renderContinuousMode()
            ) : (
              <>
                {activeTab === 'basics' && showResume && <BasicsForm />}
                {activeTab === 'work' && showResume && <WorkForm />}
                {activeTab === 'education' && showResume && <EducationForm />}
                {activeTab === 'skills' && showResume && <SkillsForm />}
                {activeTab === 'projects' && showResume && <ProjectsForm />}
                {activeTab === 'awards' && showResume && <AwardsForm />}
                {activeTab.startsWith('custom-') && showResume && <CustomSectionForm sectionId={activeTab} />}
                {activeTab === 'cover-letter' && showCoverLetter && <CoverLetterForm />}
                {activeTab === 'latex-editor' && isLatexTemplate(resumeData.selectedTemplate) && (
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  }>
                    <LaTeXEditor />
                  </Suspense>
                )}
                {activeTab === 'ai' && <AITab documentType={documentType} />}
                {activeTab === 'formatting' && (isLatexSelected ? <LaTeXFormattingForm /> : <FormattingForm />)}
                {activeTab === 'templates' && (
                  <div className="space-y-6">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Choose Template</h3>
                    {templateFilterBar}
                    <div className="grid grid-cols-2 gap-4">
                      {paginatedTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setTemplate(template.id)}
                          className={`
                            group relative flex flex-col overflow-hidden border-2 transition-all
                            ${resumeData.selectedTemplate === template.id
                              ? 'border-slate-800 ring-2 ring-slate-600/20'
                              : darkMode
                                ? 'border-slate-700 bg-slate-800 hover:border-slate-500'
                                : 'border-slate-300 bg-slate-100 hover:border-slate-400'
                            }
                          `}
                        >
                          <div className="aspect-[3/4] overflow-hidden bg-white pdf-paper border-b-2 border-slate-200 dark:border-slate-800 relative">
                            <TemplateThumbnail templateId={template.id} />
                            {resumeData.selectedTemplate === template.id && (
                              <div className="absolute inset-0 border-4 border-slate-900/40 pointer-events-none"></div>
                            )}
                            {template.isLatex && (
                              <div className="absolute top-2 right-2 bg-slate-800 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg z-10">
                                pdfTeX
                              </div>
                            )}
                          </div>

                          <div className={`
                            p-3 text-left transition-colors relative
                            ${resumeData.selectedTemplate === template.id
                              ? (darkMode ? 'bg-slate-900 border-t border-slate-700' : 'bg-white border-t border-slate-100')
                              : (darkMode ? 'bg-slate-800/50' : 'bg-slate-50')
                            }
                          `}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className={`font-bold text-sm leading-tight ${resumeData.selectedTemplate === template.id
                                  ? (darkMode ? 'text-white' : 'text-slate-900')
                                  : (darkMode ? 'text-slate-400' : 'text-slate-500')
                                  }`}>
                                  {template.name}
                                </div>
                                <div className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${resumeData.selectedTemplate === template.id
                                  ? (darkMode ? 'text-accent-light' : 'text-accent')
                                  : (darkMode ? 'text-slate-500' : 'text-slate-400')
                                  }`}>
                                  {template.description || (template.isLatex ? 'pdfTeX' : 'React PDF')}
                                </div>
                              </div>
                              {resumeData.selectedTemplate === template.id && (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-white" style={{ backgroundColor: 'var(--accent)' }}>
                                  <Check size={14} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {templatePaginationControls}

                    {/* ── My Templates ── */}
                    <div className={`border-t-2 pt-6 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Templates</h3>
                        <button
                          onClick={() => setShowCreateTemplate(!showCreateTemplate)}
                          className="btn-accent flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded"
                        >
                          <Plus size={14} />
                          <span>New Template</span>
                        </button>
                      </div>

                      {/* Create template form */}
                      {showCreateTemplate && (
                        <div className={`mb-4 p-4 border-2 ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'}`}>
                          <div className="space-y-3">
                            <div>
                              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Template Name
                              </label>
                              <input
                                type="text"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                placeholder="e.g. Software Engineer v1"
                                className={`w-full px-3 py-2 text-sm rounded border-2 ${darkMode
                                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                                  }`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Base Template
                              </label>
                              <select
                                value={newTemplateBase}
                                onChange={(e) => setNewTemplateBase(Number(e.target.value) as PreloadedTemplateId)}
                                className={`w-full px-3 py-2 text-sm rounded border-2 ${darkMode
                                  ? 'bg-slate-700 border-slate-600 text-white'
                                  : 'bg-white border-slate-300 text-slate-900'
                                  }`}
                              >
                                {templates.filter(t => !t.isLatex).map((t) => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (!newTemplateName.trim()) return;
                                  const newId = addCustomTemplate(newTemplateName.trim(), newTemplateBase, resumeData.formatting);
                                  setTemplate(newId);
                                  setNewTemplateName('');
                                  setShowCreateTemplate(false);
                                }}
                                disabled={!newTemplateName.trim()}
                                className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${!newTemplateName.trim()
                                  ? 'bg-slate-500 text-slate-300 cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-500 text-white'
                                  }`}
                              >
                                Create
                              </button>
                              <button
                                onClick={() => { setShowCreateTemplate(false); setNewTemplateName(''); }}
                                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                  }`}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Custom templates grid */}
                      {customTemplates.length === 0 && !showCreateTemplate ? (
                        <div className={`text-center py-8 border-2 border-dashed ${darkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                          <LayoutTemplate size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-semibold">No custom templates yet</p>
                          <p className="text-xs mt-1">Click "New Template" to create one with your own formatting</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {customTemplates.map((ct) => {
                            const baseName = templates.find(t => t.id === ct.baseTemplateId)?.name || 'Classic';
                            const isActive = resumeData.selectedTemplate === ct.id;
                            const isEditing = editingTemplateId === ct.id;

                            return (
                              <div
                                key={ct.id}
                                className={`
                                  group relative flex flex-col overflow-hidden border-2 transition-all cursor-pointer
                                  ${isActive
                                    ? 'border-blue-500 ring-2 ring-blue-400/20'
                                    : darkMode
                                      ? 'border-slate-700 bg-slate-800 hover:border-slate-500'
                                      : 'border-slate-300 bg-slate-100 hover:border-slate-400'
                                  }
                                `}
                              >
                                {/* Thumbnail — clicking selects the template */}
                                <button
                                  onClick={() => {
                                    setTemplate(ct.id);
                                    updateFormatting(ct.formatting);
                                  }}
                                  className="aspect-[3/4] overflow-hidden bg-white pdf-paper border-b-2 border-slate-200 dark:border-slate-800 w-full"
                                >
                                  <TemplateThumbnail templateId={ct.baseTemplateId} />
                                  {isActive && (
                                    <div className="absolute inset-0 border-4 border-blue-500/30 pointer-events-none"></div>
                                  )}
                                </button>

                                {/* Info area */}
                                <div className={`p-3 text-left transition-colors relative ${isActive
                                  ? (darkMode ? 'bg-slate-900 border-t border-blue-800' : 'bg-blue-50 border-t border-blue-100')
                                  : (darkMode ? 'bg-slate-800/50' : 'bg-slate-50')
                                  }`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          value={editingTemplateName}
                                          onChange={(e) => setEditingTemplateName(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && editingTemplateName.trim()) {
                                              updateCustomTemplate(ct.id, { name: editingTemplateName.trim() });
                                              setEditingTemplateId(null);
                                            }
                                            if (e.key === 'Escape') setEditingTemplateId(null);
                                          }}
                                          onBlur={() => {
                                            if (editingTemplateName.trim()) {
                                              updateCustomTemplate(ct.id, { name: editingTemplateName.trim() });
                                            }
                                            setEditingTemplateId(null);
                                          }}
                                          autoFocus
                                          className={`w-full px-1.5 py-0.5 text-sm font-bold rounded border ${darkMode ? 'bg-slate-700 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                                            }`}
                                        />
                                      ) : (
                                        <div className={`font-bold text-sm leading-tight truncate ${isActive ? (darkMode ? 'text-white' : 'text-slate-900') : (darkMode ? 'text-slate-300' : 'text-slate-600')
                                          }`}>
                                          {ct.name}
                                        </div>
                                      )}
                                      <div className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${isActive ? (darkMode ? 'text-accent-light' : 'text-accent') : (darkMode ? 'text-slate-500' : 'text-slate-400')
                                        }`}>
                                        Based on {baseName}
                                      </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {isActive && (
                                        <div className="text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--accent)' }}>
                                          <Check size={12} strokeWidth={3} />
                                        </div>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingTemplateId(ct.id);
                                          setEditingTemplateName(ct.name);
                                        }}
                                        title="Rename"
                                        className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                                          }`}
                                      >
                                        <Pencil size={12} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const newId = addCustomTemplate(`${ct.name} (Copy)`, ct.baseTemplateId, ct.formatting);
                                          setTemplate(newId);
                                          updateFormatting(ct.formatting);
                                        }}
                                        title="Duplicate"
                                        className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                                          }`}
                                      >
                                        <Copy size={12} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm(`Delete "${ct.name}"?`)) {
                                            deleteCustomTemplate(ct.id);
                                            if (resumeData.selectedTemplate === ct.id) {
                                              setTemplate(1); // Fall back to Classic
                                            }
                                          }
                                        }}
                                        title="Delete"
                                        className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'
                                          }`}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <aside className="w-[900px] border-l-2 flex-shrink-0" style={{ borderColor: 'var(--sidebar-border)', backgroundColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
          <div className="sticky top-0 h-screen">
            <PDFPreview templateId={resumeData.selectedTemplate} documentType={documentType} />
          </div>
        </aside>
      </div >
    </div >
  )
}

export default App
