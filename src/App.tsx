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
import { useThemeStore, applyTheme, THEMES, THEME_MAP } from './lib/themeStore'
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
  ChevronRight,
  Menu,
  X,
  Eye
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
  const { themeId, setTheme } = useThemeStore()
  const [documentType, setDocumentType] = useState<DocumentType>('resume')

  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<'all' | 'standard' | 'latex'>('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateSort, setTemplateSort] = useState<'default' | 'latex-first' | 'standard-first'>('default');
  const [templatePage, setTemplatePage] = useState(1);
  const [templatesPerPage, setTemplatesPerPage] = useState(10);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // New state for sidebar controls
  const [continuousMode, setContinuousMode] = useState(() => loadContinuousMode());
  const [showResume, setShowResume] = useState(() => loadShowResume());
  const [showCoverLetter, setShowCoverLetter] = useState(() => loadShowCoverLetter());
  const [isImporting, setIsImporting] = useState(false);

  // Mobile / responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

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
      setActiveTab(tabKey);
    } else {
      setActiveTab(tabKey);
    }
    setSidebarOpen(false); // close mobile sidebar on navigation
  };

  // Track which section is visible when scrolling in continuous mode
  useEffect(() => {
    if (!continuousMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section (highest intersection ratio)
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry) {
          const id = bestEntry.target.id; // "continuous-section-{tabKey}"
          const tabKey = id.replace('continuous-section-', '');
          setActiveTab(tabKey as TabKey);
        }
      },
      { threshold: [0.1, 0.3, 0.5, 0.7], rootMargin: '-10% 0px -60% 0px' }
    );

    // Observe all continuous sections
    const sections = document.querySelectorAll('[id^="continuous-section-"]');
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [continuousMode]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
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

  // Apply theme CSS custom properties + dark class whenever theme changes
  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

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

  // (Dark mode is controlled by theme selection — no separate toggle)

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
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--main-text-secondary)' }} />
        <input
          type="text"
          value={templateSearch}
          onChange={(e) => setTemplateSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-9 pr-3 py-2 text-sm border-2 transition-colors outline-none"
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--main-text)' }}
        />
      </div>
      {/* Filter + Sort row */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'latex', 'standard'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setTemplateFilter(filter)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors border-2 ${templateFilter === filter ? 'btn-accent' : ''}`}
            style={templateFilter !== filter ? { backgroundColor: 'transparent', borderColor: 'var(--card-border)', color: 'var(--main-text-secondary)' } : {}}
          >
            {filter === 'all' ? 'All' : filter === 'latex' ? 'LaTeX' : 'Standard'}
          </button>
        ))}
        <div className="flex-1" />
        {/* Sort dropdown */}
        <select
          value={templateSort}
          onChange={(e) => setTemplateSort(e.target.value as typeof templateSort)}
          className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 outline-none cursor-pointer transition-colors"
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--main-text-secondary)' }}
        >
          <option value="default">Default Order</option>
          <option value="latex-first">LaTeX First</option>
          <option value="standard-first">Standard First</option>
        </select>
      </div>
      {/* Count */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--main-text-secondary)' }}>
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          {templateSearch.trim() && ' found'}
        </span>
      </div>
    </div>
  );

  // Pagination controls JSX (reused in both modes)
  const templatePaginationControls = filteredTemplates.length > 10 ? (
    <div className="flex items-center justify-between flex-wrap gap-2 mt-4 pt-4 border-t-2" style={{ borderColor: 'var(--card-border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--main-text-secondary)' }}>
          Per page:
        </span>
        {perPageOptions.map(n => (
          <button
            key={n}
            onClick={() => setTemplatesPerPage(n)}
            className={`px-2 py-1 text-[10px] font-bold border-2 transition-colors ${templatesPerPage === n ? 'btn-accent' : ''}`}
            style={templatesPerPage !== n ? { backgroundColor: 'transparent', borderColor: 'var(--card-border)', color: 'var(--main-text-secondary)' } : {}}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTemplatePage(p => Math.max(1, p - 1))}
          disabled={templatePage <= 1}
          className="p-1 border-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--card-border)', color: 'var(--main-text-secondary)' }}
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--main-text-secondary)' }}>
          {templatePage} / {totalTemplatePages}
        </span>
        <button
          onClick={() => setTemplatePage(p => Math.min(totalTemplatePages, p + 1))}
          disabled={templatePage >= totalTemplatePages}
          className="p-1 border-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--card-border)', color: 'var(--main-text-secondary)' }}
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
    const dividerClass = 'pb-8 mb-8 border-b-2' as const;

    // Template selector
    sections.push(
      <div key="templates" id="continuous-section-templates" className={dividerClass}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--main-text)' }}>Choose Template</h3>
        {templateFilterBar}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {paginatedTemplates.map((template) => {
            const isSelected = resumeData.selectedTemplate === template.id;
            return (
              <button
                key={template.id}
                onClick={() => setTemplate(template.id)}
                className="group relative flex flex-col overflow-hidden border-2 transition-all"
                style={{
                  borderColor: isSelected ? 'var(--accent)' : 'var(--card-border)',
                  backgroundColor: 'var(--card-bg)',
                }}
              >
                <div className="overflow-hidden bg-white pdf-paper relative" style={{ borderBottom: '2px solid var(--card-border)' }}>
                  <TemplateThumbnail templateId={template.id} />
                  {isSelected && (
                    <div className="absolute inset-0 pointer-events-none" style={{ border: '4px solid var(--accent)', opacity: 0.4 }}></div>
                  )}
                  {template.isLatex && (
                    <div className="absolute top-2 right-2 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg z-10" style={{ backgroundColor: '#1e293b' }}>
                      pdfTeX
                    </div>
                  )}
                </div>
                <div
                  className="p-3 text-left transition-colors relative"
                  style={{
                    backgroundColor: isSelected ? 'var(--main-bg)' : 'var(--card-bg)',
                    borderTop: isSelected ? '1px solid var(--card-border)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm leading-tight" style={{ color: isSelected ? 'var(--main-text)' : 'var(--main-text-secondary)' }}>
                        {template.name}
                      </div>
                      <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: isSelected ? 'var(--accent)' : 'var(--main-text-secondary)' }}>
                        {template.description || (template.isLatex ? 'pdfTeX' : 'React PDF')}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-white" style={{ backgroundColor: 'var(--accent)' }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {templatePaginationControls}

        {/* ── My Templates (Continuous Mode) ── */}
        <div className="border-t-2 pt-6 mt-6" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--main-text)' }}>My Templates</h3>
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
            <div className="mb-4 p-4 border-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--main-text-secondary)' }}>
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g. Software Engineer v1"
                    className="w-full px-3 py-2 text-sm rounded border-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--main-text-secondary)' }}>
                    Base Template
                  </label>
                  <select
                    value={newTemplateBase}
                    onChange={(e) => setNewTemplateBase(Number(e.target.value) as PreloadedTemplateId)}
                    className="w-full px-3 py-2 text-sm rounded border-2"
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
                      ? 'cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                    style={!newTemplateName.trim() ? { backgroundColor: 'var(--input-border)', color: 'var(--main-text-secondary)' } : {}}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setShowCreateTemplate(false); setNewTemplateName(''); }}
                    className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors"
                    style={{ backgroundColor: 'var(--card-bg)', color: 'var(--main-text)', border: '1px solid var(--card-border)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom templates grid */}
          {customTemplates.length === 0 && !showCreateTemplate ? (
            <div className="text-center py-8 border-2 border-dashed" style={{ borderColor: 'var(--card-border)', color: 'var(--main-text-secondary)' }}>
              <LayoutTemplate size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No custom templates yet</p>
              <p className="text-xs mt-1">Click "New Template" to create one with your own formatting</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {customTemplates.map((ct) => {
                const baseName = templates.find(t => t.id === ct.baseTemplateId)?.name || 'Classic';
                const isActive = resumeData.selectedTemplate === ct.id;
                const isEditing = editingTemplateId === ct.id;

                return (
                  <div
                    key={ct.id}
                    className="group relative flex flex-col overflow-hidden border-2 transition-all cursor-pointer"
                    style={{
                      borderColor: isActive ? 'var(--accent)' : 'var(--card-border)',
                      backgroundColor: 'var(--card-bg)',
                    }}
                  >
                    <button
                      onClick={() => {
                        setTemplate(ct.id);
                        updateFormatting(ct.formatting);
                      }}
                      className="overflow-hidden bg-white pdf-paper w-full"
                      style={{ borderBottom: '2px solid var(--card-border)' }}
                    >
                      <TemplateThumbnail templateId={ct.baseTemplateId} />
                      {isActive && (
                        <div className="absolute inset-0 pointer-events-none" style={{ border: '4px solid var(--accent)', opacity: 0.3 }}></div>
                      )}
                    </button>

                    <div
                      className="p-3 text-left transition-colors relative"
                      style={{
                        backgroundColor: isActive ? 'var(--main-bg)' : 'var(--card-bg)',
                        borderTop: isActive ? '1px solid var(--accent)' : 'none',
                      }}
                    >
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
                              className="w-full px-1.5 py-0.5 text-sm font-bold rounded border"
                            />
                          ) : (
                            <div className="font-bold text-sm leading-tight truncate" style={{ color: isActive ? 'var(--main-text)' : 'var(--main-text-secondary)' }}>
                              {ct.name}
                            </div>
                          )}
                          <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: isActive ? 'var(--accent)' : 'var(--main-text-secondary)' }}>
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
                            className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                            style={{ color: 'var(--main-text-secondary)' }}
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
                            className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                            style={{ color: 'var(--main-text-secondary)' }}
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
                            className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500"
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
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: 'var(--main-bg)' }}>
      {/* ━━ Mobile Header ━━ */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b-2 flex-shrink-0 z-40 sticky top-0 shadow-sm"
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
        <button onClick={() => setSidebarOpen(v => !v)} className="p-1 rounded transition-colors active:scale-95"
          style={{ color: 'var(--sidebar-text)' }}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-sm font-black tracking-tighter uppercase italic" style={{ color: 'var(--sidebar-text)' }}>Resume Builder</span>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      {/* ━━ Mobile Bottom Navigation ━━ */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 h-14 bg-white border-2 z-50 flex items-center justify-around px-2 rounded-2xl shadow-2xl backdrop-blur-md"
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
        <button
          onClick={() => setMobileView('form')}
          className={`flex flex-col items-center gap-0.5 transition-all flex-1 py-1 rounded-xl ${mobileView === 'form' ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <Pencil size={18} />
          <span className="text-[9px] font-extrabold uppercase tracking-widest">Edit</span>
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex flex-col items-center gap-0.5 transition-all flex-1 py-1 rounded-xl ${mobileView === 'preview' ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <Eye size={18} />
          <span className="text-[9px] font-extrabold uppercase tracking-widest">Preview</span>
        </button>
        <button
          onClick={() => {
            setMobileView('form');
            handleSidebarClick('templates');
            setSidebarOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 transition-all flex-1 py-1 rounded-xl opacity-40 hover:opacity-100`}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <LayoutTemplate size={18} />
          <span className="text-[9px] font-extrabold uppercase tracking-widest">Layout</span>
        </button>
        <button
          onClick={() => setSidebarOpen(true)}
          className={`flex flex-col items-center gap-0.5 transition-all flex-1 py-1 rounded-xl opacity-40 hover:opacity-100`}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <Plus size={18} />
          <span className="text-[9px] font-extrabold uppercase tracking-widest">More</span>
        </button>
      </div>

      {/* ━━ Mobile Sidebar Overlay ━━ */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex w-full">
        {/* ━━ Sidebar ━━
            Desktop: always visible, w-56
            Mobile: slide-out drawer (fixed, overlays content) */}
        <aside className={`
          w-56 flex-shrink-0 border-r-2 z-40
          fixed lg:relative top-0 left-0 h-full
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', borderColor: 'var(--sidebar-border)' }}>
          <div className="sticky top-0 h-screen flex flex-col overflow-y-auto">
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
                  <div className="w-9 h-5 rounded-full transition-all"
                    style={{ backgroundColor: continuousMode ? 'var(--accent)' : 'var(--input-border)' }}
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
                        isActive={activeTab === tab.key}
                        onClick={() => handleSidebarClick(tab.key)}
                      />
                    ))}

                    {/* Sortable Sections (only if resume is enabled) */}
                    {showResume && sectionTabs.map((tab) => (
                      <SidebarItem
                        key={tab.key}
                        tab={tab}
                        isActive={activeTab === tab.key}
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
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors border-l-4 border-transparent"
                        style={{ color: 'var(--sidebar-text)' }}
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
                        isActive={activeTab === tab.key}
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
                  className={`w-full flex items-center justify-center gap-2 px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors rounded btn-accent ${(isGeneratingPDF || isPrinting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FileDown size={14} />
                  <span>{isGeneratingPDF ? 'Generating...' : isPrinting ? 'Preparing...' : 'Export'}</span>
                  <ChevronDown size={10} className={`transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {exportDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-1 w-full shadow-xl border-2 z-50 overflow-hidden" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
                    <button
                      onClick={() => { setExportDropdownOpen(false); handleDownloadPDF(); }}
                      disabled={isGeneratingPDF}
                      className={`w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ color: 'var(--sidebar-text)' }}
                    >
                      <FileDown size={12} className="text-teal-400" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => { setExportDropdownOpen(false); handlePrint(); }}
                      disabled={isPrinting}
                      className={`w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${isPrinting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ color: 'var(--sidebar-text)' }}
                    >
                      <Printer size={12} className="text-blue-400" />
                      Print / Preview
                    </button>
                    {isLatexSelected && (
                      <>
                        <div style={{ borderTop: '1px solid var(--sidebar-border)' }} />
                        <button
                          onClick={() => { setExportDropdownOpen(false); handleDownloadTex(); }}
                          className="w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                          style={{ color: 'var(--sidebar-text)' }}
                        >
                          <Code2 size={12} className="text-emerald-400" />
                          Download .tex
                        </button>
                      </>
                    )}
                    <div style={{ borderTop: '1px solid var(--sidebar-border)' }} />
                    <button
                      onClick={() => { setExportDropdownOpen(false); handleExport(); }}
                      className="w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                      style={{ color: 'var(--sidebar-text)' }}
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
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors rounded ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: 'var(--sidebar-hover)', color: 'var(--sidebar-text)' }}
                >
                  <Upload size={12} />
                  <span>{isImporting ? 'Importing...' : 'Import'}</span>
                </button>
                <button
                  onClick={loadSampleData}
                  className="flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors rounded"
                  style={{ backgroundColor: 'var(--sidebar-hover)', color: 'var(--sidebar-text)' }}
                >
                  <FileText size={12} />
                  <span>Sample</span>
                </button>
              </div>
              {/* Theme dropdown — single source of truth for all styling */}
              <div ref={themeDropdownRef} className="relative">
                <button
                  onClick={() => setThemeDropdownOpen(prev => !prev)}
                  className="w-full flex items-center justify-center gap-2 px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors rounded"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                >
                  <Palette size={14} />
                  <span>{THEME_MAP[themeId]?.name || 'Theme'}</span>
                  <ChevronDown size={10} className={`transition-transform ${themeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-1 w-full shadow-xl border-2 z-50 overflow-hidden max-h-72 overflow-y-auto" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => { setTheme(theme.id); setThemeDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${themeId === theme.id ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                        style={{
                          color: 'var(--sidebar-text)',
                          backgroundColor: themeId === theme.id ? 'var(--sidebar-hover)' : 'transparent',
                        }}
                      >
                        <div className="w-4 h-4 rounded-full flex-shrink-0 border border-white/20" style={{ backgroundColor: theme.swatch }} />
                        <span className="flex-1">{theme.name}</span>
                        <span className="text-[8px] opacity-50">{theme.isDark ? 'dark' : 'light'}</span>
                        {themeId === theme.id && (
                          <Check size={11} className="ml-1" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors rounded bg-red-700 hover:bg-red-800 text-white"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ━━ Main Content ━━
            Mobile: full-width, hidden when preview is active
            Desktop: flex-1 */}
        <main className={`flex-1 px-2 py-3 sm:p-4 lg:p-6 overflow-y-auto pb-24 lg:pb-6 ${mobileView !== 'form' ? 'hidden lg:block' : ''}`}
          style={{ backgroundColor: 'var(--main-bg)', color: 'var(--main-text)' }}>
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
                    <h3 className="text-lg font-bold" style={{ color: 'var(--main-text)' }}>Choose Template</h3>
                    {templateFilterBar}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {paginatedTemplates.map((template) => {
                        const isSelected = resumeData.selectedTemplate === template.id;
                        return (
                          <button
                            key={template.id}
                            onClick={() => setTemplate(template.id)}
                            className="group relative flex flex-col overflow-hidden border-2 transition-all"
                            style={{
                              borderColor: isSelected ? 'var(--accent)' : 'var(--card-border)',
                              backgroundColor: 'var(--card-bg)',
                            }}
                          >
                            <div className="overflow-hidden bg-white pdf-paper relative" style={{ borderBottom: '2px solid var(--card-border)' }}>
                              <TemplateThumbnail templateId={template.id} />
                              {isSelected && (
                                <div className="absolute inset-0 pointer-events-none" style={{ border: '4px solid var(--accent)', opacity: 0.4 }}></div>
                              )}
                              {template.isLatex && (
                                <div className="absolute top-2 right-2 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg z-10" style={{ backgroundColor: '#1e293b' }}>
                                  pdfTeX
                                </div>
                              )}
                            </div>

                            <div
                              className="p-3 text-left transition-colors relative"
                              style={{
                                backgroundColor: isSelected ? 'var(--main-bg)' : 'var(--card-bg)',
                                borderTop: isSelected ? '1px solid var(--card-border)' : 'none',
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-sm leading-tight" style={{ color: isSelected ? 'var(--main-text)' : 'var(--main-text-secondary)' }}>
                                    {template.name}
                                  </div>
                                  <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: isSelected ? 'var(--accent)' : 'var(--main-text-secondary)' }}>
                                    {template.description || (template.isLatex ? 'pdfTeX' : 'React PDF')}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-white" style={{ backgroundColor: 'var(--accent)' }}>
                                    <Check size={14} strokeWidth={3} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {templatePaginationControls}

                    {/* ── My Templates ── */}
                    <div className="border-t-2 pt-6" style={{ borderColor: 'var(--card-border)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--main-text)' }}>My Templates</h3>
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
                        <div className="mb-4 p-4 border-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--main-text-secondary)' }}>
                                Template Name
                              </label>
                              <input
                                type="text"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                placeholder="e.g. Software Engineer v1"
                                className="w-full px-3 py-2 text-sm rounded border-2"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--main-text-secondary)' }}>
                                Base Template
                              </label>
                              <select
                                value={newTemplateBase}
                                onChange={(e) => setNewTemplateBase(Number(e.target.value) as PreloadedTemplateId)}
                                className="w-full px-3 py-2 text-sm rounded border-2"
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
                                  ? 'cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-500 text-white'
                                  }`}
                                style={!newTemplateName.trim() ? { backgroundColor: 'var(--input-border)', color: 'var(--main-text-secondary)' } : {}}
                              >
                                Create
                              </button>
                              <button
                                onClick={() => { setShowCreateTemplate(false); setNewTemplateName(''); }}
                                className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors"
                                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--main-text)', border: '1px solid var(--card-border)' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Custom templates grid */}
                      {customTemplates.length === 0 && !showCreateTemplate ? (
                        <div className="text-center py-8 border-2 border-dashed" style={{ borderColor: 'var(--card-border)', color: 'var(--main-text-secondary)' }}>
                          <LayoutTemplate size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-semibold">No custom templates yet</p>
                          <p className="text-xs mt-1">Click "New Template" to create one with your own formatting</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {customTemplates.map((ct) => {
                            const baseName = templates.find(t => t.id === ct.baseTemplateId)?.name || 'Classic';
                            const isActive = resumeData.selectedTemplate === ct.id;
                            const isEditing = editingTemplateId === ct.id;

                            return (
                              <div
                                key={ct.id}
                                className="group relative flex flex-col overflow-hidden border-2 transition-all cursor-pointer"
                                style={{
                                  borderColor: isActive ? 'var(--accent)' : 'var(--card-border)',
                                  backgroundColor: 'var(--card-bg)',
                                }}
                              >
                                <button
                                  onClick={() => {
                                    setTemplate(ct.id);
                                    updateFormatting(ct.formatting);
                                  }}
                                  className="overflow-hidden bg-white pdf-paper w-full"
                                  style={{ borderBottom: '2px solid var(--card-border)' }}
                                >
                                  <TemplateThumbnail templateId={ct.baseTemplateId} />
                                  {isActive && (
                                    <div className="absolute inset-0 pointer-events-none" style={{ border: '4px solid var(--accent)', opacity: 0.3 }}></div>
                                  )}
                                </button>

                                <div
                                  className="p-3 text-left transition-colors relative"
                                  style={{
                                    backgroundColor: isActive ? 'var(--main-bg)' : 'var(--card-bg)',
                                    borderTop: isActive ? '1px solid var(--accent)' : 'none',
                                  }}
                                >
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
                                          className="w-full px-1.5 py-0.5 text-sm font-bold rounded border"
                                        />
                                      ) : (
                                        <div className="font-bold text-sm leading-tight truncate" style={{ color: isActive ? 'var(--main-text)' : 'var(--main-text-secondary)' }}>
                                          {ct.name}
                                        </div>
                                      )}
                                      <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: isActive ? 'var(--accent)' : 'var(--main-text-secondary)' }}>
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
                                        className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                        style={{ color: 'var(--main-text-secondary)' }}
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
                                        className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                        style={{ color: 'var(--main-text-secondary)' }}
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
                                        className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500"
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

        {/* ━━ PDF Preview Panel ━━
            Mobile: full-width, shown only when mobileView='preview'
            Tablet: w-[450px]
            Desktop: w-[900px] */}
        <aside className={`
          flex-shrink-0
          w-full lg:w-[900px] md:w-[450px]
          pb-20 lg:pb-0
          ${mobileView !== 'preview' ? 'hidden lg:block md:block' : ''}
        `} style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="sticky top-0 h-[calc(100vh-48px)] lg:h-screen">
            <PDFPreview templateId={resumeData.selectedTemplate} documentType={documentType} />
          </div>
        </aside>
      </div >
    </div >
  )
}

export default App
