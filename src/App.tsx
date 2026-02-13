import { useState, useEffect, useRef } from 'react'
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
import { TemplateThumbnail } from './components/preview/TemplateThumbnail'
import { PDFPreview } from './components/preview/PDFPreview'
import type { TemplateId, SectionKey, DocumentType } from './types'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import {
  exportToJSON, importFromJSON,
  saveDarkMode, loadDarkMode, saveActiveTab, loadActiveTab,
  saveCoverLetterData, loadCoverLetterData, saveDocumentType, loadDocumentType,
  saveContinuousMode, loadContinuousMode, saveShowResume, loadShowResume,
  saveShowCoverLetter, loadShowCoverLetter
} from './lib/storage'
import { loadPrefillData } from './lib/loadFromUrl'
import { parseResumeFile } from './lib/resumeParser'
import { pdf } from '@react-pdf/renderer'
import { ClassicPDFTemplate } from './templates/pdf/ClassicPDFTemplate'
import { ModernPDFTemplate } from './templates/pdf/ModernPDFTemplate'
import { MinimalPDFTemplate } from './templates/pdf/MinimalPDFTemplate'
import { ExecutivePDFTemplate } from './templates/pdf/ExecutivePDFTemplate'
import { CreativePDFTemplate } from './templates/pdf/CreativePDFTemplate'
import { TechnicalPDFTemplate } from './templates/pdf/TechnicalPDFTemplate'
import { ElegantPDFTemplate } from './templates/pdf/ElegantPDFTemplate'
import { CompactPDFTemplate } from './templates/pdf/CompactPDFTemplate'
import { AcademicPDFTemplate } from './templates/pdf/AcademicPDFTemplate'
import { LaTeXPDFTemplate } from './templates/pdf/LaTeXPDFTemplate'
import { CoverLetterPDFTemplate } from './templates/pdf/CoverLetterPDFTemplate'
import { useCoverLetterStore } from './lib/coverLetterStore'
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
  Mail
} from 'lucide-react'
import './styles/index.css'

// Tab system types
type TabKey = 'basics' | 'work' | 'education' | 'skills' | 'projects' | 'awards' | 'custom-sections' | 'cover-letter' | 'templates' | 'formatting' | 'ai' | string;

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  draggable?: boolean;
  sectionKey?: SectionKey;
}

const templates: Array<{ id: TemplateId; name: string }> = [
  { id: 1, name: 'Classic' },
  { id: 2, name: 'Modern' },
  { id: 3, name: 'Minimal' },
  { id: 4, name: 'Executive' },
  { id: 5, name: 'Creative' },
  { id: 6, name: 'Technical' },
  { id: 7, name: 'Elegant' },
  { id: 8, name: 'Compact' },
  { id: 9, name: 'Academic' },
  { id: 10, name: 'LaTeX' },
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
      style={style}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 font-semibold transition-all border-l-4 cursor-pointer
        ${isActive
          ? 'bg-slate-900 dark:bg-slate-950 !text-white border-white dark:border-white'
          : 'bg-transparent !text-white border-transparent hover:bg-slate-900/40'
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
    addCustomSection
  } = useResumeStore();
  const { coverLetterData } = useCoverLetterStore()
  const [activeTab, setActiveTab] = useState<TabKey>(() => loadActiveTab() as TabKey)
  const [darkMode, setDarkMode] = useState(() => loadDarkMode())
  const [documentType, setDocumentType] = useState<DocumentType>('resume')

  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // New state for sidebar controls
  const [continuousMode, setContinuousMode] = useState(() => loadContinuousMode());
  const [showResume, setShowResume] = useState(() => loadShowResume());
  const [showCoverLetter, setShowCoverLetter] = useState(() => loadShowCoverLetter());
  const [isImporting, setIsImporting] = useState(false);

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

  // Persist dark mode
  useEffect(() => {
    saveDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
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
  const primarySettings: TabItem[] = [
    { key: 'templates', label: 'Template', icon: <LayoutTemplate size={18} />, draggable: false },
    { key: 'formatting', label: 'Formatting', icon: <Palette size={18} />, draggable: false },
  ];

  const secondarySettings: TabItem[] = [
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
      let templateComponent;
      let fileName;

      if (documentType === 'coverletter') {
        templateComponent = <CoverLetterPDFTemplate data={coverLetterData} />;
        fileName = `cover_letter_${coverLetterData.company || 'document'}`.replace(/[^a-z0-9._-]/gi, '_');
      } else {
        switch (resumeData.selectedTemplate) {
          case 1:
            templateComponent = <ClassicPDFTemplate data={resumeData} />;
            break;
          case 2:
            templateComponent = <ModernPDFTemplate data={resumeData} />;
            break;
          case 3:
            templateComponent = <MinimalPDFTemplate data={resumeData} />;
            break;
          case 4:
            templateComponent = <ExecutivePDFTemplate data={resumeData} />;
            break;
          case 5:
            templateComponent = <CreativePDFTemplate data={resumeData} />;
            break;
          case 6:
            templateComponent = <TechnicalPDFTemplate data={resumeData} />;
            break;
          case 7:
            templateComponent = <ElegantPDFTemplate data={resumeData} />;
            break;
          case 8:
            templateComponent = <CompactPDFTemplate data={resumeData} />;
            break;
          case 9:
            templateComponent = <AcademicPDFTemplate data={resumeData} />;
            break;
          case 10:
            templateComponent = <LaTeXPDFTemplate data={resumeData} />;
            break;
          default:
            templateComponent = <ClassicPDFTemplate data={resumeData} />;
        }
        fileName = `${resumeData.basics.name || 'resume'}`.replace(/[^a-z0-9._-]/gi, '_');
      }

      const blob = await pdf(templateComponent).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      let templateComponent;

      if (documentType === 'coverletter') {
        templateComponent = <CoverLetterPDFTemplate data={coverLetterData} />;
      } else {
        switch (resumeData.selectedTemplate) {
          case 1:
            templateComponent = <ClassicPDFTemplate data={resumeData} />;
            break;
          case 2:
            templateComponent = <ModernPDFTemplate data={resumeData} />;
            break;
          case 3:
            templateComponent = <MinimalPDFTemplate data={resumeData} />;
            break;
          case 4:
            templateComponent = <ExecutivePDFTemplate data={resumeData} />;
            break;
          case 5:
            templateComponent = <CreativePDFTemplate data={resumeData} />;
            break;
          case 6:
            templateComponent = <TechnicalPDFTemplate data={resumeData} />;
            break;
          case 7:
            templateComponent = <ElegantPDFTemplate data={resumeData} />;
            break;
          case 8:
            templateComponent = <CompactPDFTemplate data={resumeData} />;
            break;
          case 9:
            templateComponent = <AcademicPDFTemplate data={resumeData} />;
            break;
          case 10:
            templateComponent = <LaTeXPDFTemplate data={resumeData} />;
            break;
          default:
            templateComponent = <ClassicPDFTemplate data={resumeData} />;
        }
      }

      const blob = await pdf(templateComponent).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

    } catch (error) {
      console.error('Print generation error:', error);
      alert('Print generation failed. Please try again.');
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
        <div className="grid grid-cols-2 gap-4">
          {templates.map((template) => (
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
              <div className="aspect-[3/4] overflow-hidden bg-white pdf-paper border-b-2 border-slate-200 dark:border-slate-800">
                <TemplateThumbnail templateId={template.id} />
                {resumeData.selectedTemplate === template.id && (
                  <div className="absolute inset-0 border-4 border-slate-900/40 pointer-events-none"></div>
                )}
              </div>
              <div className={`
                p-4 text-left transition-colors relative
                ${resumeData.selectedTemplate === template.id
                  ? (darkMode ? 'bg-slate-900 border-t border-slate-700' : 'bg-white border-t border-slate-100')
                  : (darkMode ? 'bg-slate-800/50' : 'bg-slate-50')
                }
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-lg leading-tight ${resumeData.selectedTemplate === template.id
                      ? (darkMode ? 'text-white' : 'text-slate-900')
                      : (darkMode ? 'text-slate-400' : 'text-slate-500')
                      }`}>
                      {template.name}
                    </div>
                    <div className={`text-xs font-semibold mt-0.5 uppercase tracking-wider ${resumeData.selectedTemplate === template.id
                      ? (darkMode ? 'text-blue-400' : 'text-blue-600')
                      : (darkMode ? 'text-slate-500' : 'text-slate-400')
                      }`}>
                      TEMPLATE 0{template.id}
                    </div>
                  </div>
                  {resumeData.selectedTemplate === template.id && (
                    <div className={`${darkMode ? 'bg-blue-500 text-white' : 'bg-slate-900 text-white'} w-6 h-6 rounded-full flex items-center justify-center shadow-sm`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );

    // Formatting options
    sections.push(
      <div key="formatting" id="continuous-section-formatting" className={dividerClass}>
        <FormattingForm />
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
        <aside className={`w-56 flex-shrink-0 border-r-2 text-white ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-600 border-slate-700'}`}>
          <div className="sticky top-0 h-screen flex flex-col">
            {/* Document Type Toggles */}
            <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-500'}`}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Document Type</div>
              <label className="flex items-center gap-2.5 cursor-pointer mb-2 group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showResume}
                    onChange={handleToggleResume}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all ${showResume
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-white/40 group-hover:border-white/60'
                    }`}>
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
                  <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all ${showCoverLetter
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-white/40 group-hover:border-white/60'
                    }`}>
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
            <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-500'}`}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={continuousMode}
                    onChange={() => setContinuousMode(!continuousMode)}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-all ${continuousMode ? 'bg-blue-500' : 'bg-slate-500 group-hover:bg-slate-400'
                    }`}>
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

            {/* Bottom Controls: Import, Sample, Theme, Reset */}
            <div className={`border-t ${darkMode ? 'border-slate-700' : 'border-slate-500'} p-3 space-y-2`}>
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
                {activeTab === 'ai' && <AITab documentType={documentType} />}
                {activeTab === 'formatting' && <FormattingForm />}
                {activeTab === 'templates' && (
                  <div className="space-y-4">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Choose Template</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {templates.map((template) => (
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
                          <div className="aspect-[3/4] overflow-hidden bg-white pdf-paper border-b-2 border-slate-200 dark:border-slate-800">
                            <TemplateThumbnail templateId={template.id} />
                            {resumeData.selectedTemplate === template.id && (
                              <div className="absolute inset-0 border-4 border-slate-900/40 pointer-events-none"></div>
                            )}
                          </div>

                          <div className={`
                            p-4 text-left transition-colors relative
                            ${resumeData.selectedTemplate === template.id
                              ? (darkMode ? 'bg-slate-900 border-t border-slate-700' : 'bg-white border-t border-slate-100')
                              : (darkMode ? 'bg-slate-800/50' : 'bg-slate-50')
                            }
                          `}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className={`font-bold text-lg leading-tight ${resumeData.selectedTemplate === template.id
                                  ? (darkMode ? 'text-white' : 'text-slate-900')
                                  : (darkMode ? 'text-slate-400' : 'text-slate-500')
                                  }`}>
                                  {template.name}
                                </div>
                                <div className={`text-xs font-semibold mt-0.5 uppercase tracking-wider ${resumeData.selectedTemplate === template.id
                                  ? (darkMode ? 'text-blue-400' : 'text-blue-600')
                                  : (darkMode ? 'text-slate-500' : 'text-slate-400')
                                  }`}>
                                  TEMPLATE 0{template.id}
                                </div>
                              </div>
                              {resumeData.selectedTemplate === template.id && (
                                <div className={`${darkMode ? 'bg-blue-500 text-white' : 'bg-slate-900 text-white'} w-6 h-6 rounded-full flex items-center justify-center shadow-sm`}>
                                  <Check size={14} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <aside className={`w-[900px] border-l-2 flex-shrink-0 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
          <div className="sticky top-0 h-screen flex flex-col">
            <div className={`p-3 border-b-2 flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
              <div className={`text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Live PDF Preview</div>
              <div className="flex gap-2">
                {/* Export Dropdown */}
                <div ref={exportDropdownRef} className="relative">
                  <button
                    onClick={() => setExportDropdownOpen(prev => !prev)}
                    disabled={isGeneratingPDF || isPrinting}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-2 bg-teal-700 hover:bg-teal-800 text-white ${(isGeneratingPDF || isPrinting) ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'border-transparent' : 'border-slate-300'}`}
                  >
                    <FileDown size={14} />
                    <span>{isGeneratingPDF ? 'Generating...' : isPrinting ? 'Preparing...' : 'Export'}</span>
                    <ChevronDown size={12} className={`transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {exportDropdownOpen && (
                    <div className={`absolute right-0 top-full mt-1 w-52 rounded shadow-xl border-2 z-50 overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}>
                      <button
                        onClick={() => { setExportDropdownOpen(false); handleDownloadPDF(); }}
                        disabled={isGeneratingPDF}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'text-white hover:bg-slate-700' : 'text-slate-800 hover:bg-slate-100'}`}
                      >
                        <FileDown size={14} className="text-teal-500" />
                        Download PDF
                      </button>
                      <button
                        onClick={() => { setExportDropdownOpen(false); handlePrint(); }}
                        disabled={isPrinting}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${isPrinting ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'text-white hover:bg-slate-700' : 'text-slate-800 hover:bg-slate-100'}`}
                      >
                        <Printer size={14} className="text-blue-500" />
                        Print / Preview
                      </button>
                      <div className={`border-t ${darkMode ? 'border-slate-600' : 'border-slate-200'}`} />
                      <button
                        onClick={() => { setExportDropdownOpen(false); handleExport(); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${darkMode ? 'text-white hover:bg-slate-700' : 'text-slate-800 hover:bg-slate-100'}`}
                      >
                        <Download size={14} className="text-amber-500" />
                        Export JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`flex-1 overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
              <PDFPreview templateId={resumeData.selectedTemplate} documentType={documentType} />
            </div>
          </div>
        </aside>
      </div >
    </div >
  )
}

export default App
