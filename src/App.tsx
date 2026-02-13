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
import { saveResumeData, loadResumeData, exportToJSON, importFromJSON, saveDarkMode, loadDarkMode, saveActiveTab, loadActiveTab, saveCoverLetterData, loadCoverLetterData, saveDocumentType, loadDocumentType } from './lib/storage'
import { loadPrefillData } from './lib/loadFromUrl'
import { pdf } from '@react-pdf/renderer'
import { ClassicPDFTemplate } from './templates/pdf/ClassicPDFTemplate'
import { ModernPDFTemplate } from './templates/pdf/ModernPDFTemplate'
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
  ChevronDown
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

  // Load saved data on mount, then apply URL hash data (which wins over localStorage)
  useEffect(() => {
    const savedResume = loadResumeData();
    if (savedResume) {
      if (savedResume.sections) {
        savedResume.sections = Array.from(new Set(savedResume.sections));
      }
      useResumeStore.setState({ resumeData: savedResume });
    }

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

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveResumeData(resumeData);
      saveCoverLetterData(coverLetterData);
      saveDocumentType(documentType);
    }, 30000);
    return () => clearInterval(interval);
  }, [resumeData, coverLetterData, documentType]);

  // Sync documentType with activeTab
  useEffect(() => {
    if (activeTab === 'cover-letter') {
      setDocumentType('coverletter');
    } else {
      setDocumentType('resume');
    }
  }, [activeTab]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
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

  // Import JSON
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = importFromJSON(event.target?.result as string);
          useResumeStore.setState({ resumeData: data });
          alert('Resume data imported successfully!');
        } catch {
          alert('Failed to import: Invalid JSON format');
        }
      };
      reader.readAsText(file);
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
    { key: 'cover-letter', label: 'Cover Letter', icon: <File size={18} />, draggable: false },
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
          default:
            templateComponent = <ModernPDFTemplate data={resumeData} />;
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
          default:
            templateComponent = <ModernPDFTemplate data={resumeData} />;
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

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <div className="flex-1 flex w-full">
        <aside className={`w-56 flex-shrink-0 border-r-2 text-white ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-600 border-slate-700'}`}>
          <div className="sticky top-0">
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
                      onClick={() => setActiveTab(tab.key)}
                    />
                  ))}

                  {/* Sortable Sections */}
                  {sectionTabs.map((tab) => (
                    <SidebarItem
                      key={tab.key}
                      tab={tab}
                      isActive={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                    />
                  ))}

                  {/* Add Button Above Cover Letter */}
                  <button
                    onClick={() => {
                      const newId = addCustomSection();
                      setActiveTab(newId);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 !text-white hover:bg-slate-900/40 transition-colors border-l-4 border-transparent"
                  >
                    <Plus size={16} />
                    <span className="text-sm font-semibold !text-white">Add Custom Section</span>
                  </button>

                  {/* Secondary Settings */}
                  {secondarySettings.map((tab) => (
                    <SidebarItem
                      key={tab.key}
                      tab={tab}
                      isActive={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </aside>

        <main className={`flex-1 p-6 overflow-y-auto ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
          <div className="w-full max-w-5xl mx-auto">
            {activeTab === 'basics' && <BasicsForm />}
            {activeTab === 'work' && <WorkForm />}
            {activeTab === 'education' && <EducationForm />}
            {activeTab === 'skills' && <SkillsForm />}
            {activeTab === 'projects' && <ProjectsForm />}
            {activeTab === 'awards' && <AwardsForm />}
            {activeTab.startsWith('custom-') && <CustomSectionForm sectionId={activeTab} />}
            {activeTab === 'cover-letter' && <CoverLetterForm />}
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
          </div>
        </main>

        <aside className={`w-[900px] border-l-2 flex-shrink-0 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
          <div className="sticky top-0 h-screen flex flex-col">
            <div className={`p-3 border-b-2 flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
              <div className={`text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Live PDF Preview</div>
              <div className="flex gap-2">
                <button
                  onClick={toggleDarkMode}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-2 ${darkMode ? 'bg-slate-600 hover:bg-slate-500 text-white border-transparent' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'}`}
                  title="Toggle Dark Mode"
                >
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                  <span>{darkMode ? 'Light' : 'Dark'}</span>
                </button>
                <button
                  onClick={handleImport}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-2 ${darkMode ? 'bg-slate-600 hover:bg-slate-500 text-white border-transparent' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'}`}
                >
                  <Upload size={14} />
                  <span>Import</span>
                </button>
                <button
                  onClick={loadSampleData}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-2 ${darkMode ? 'bg-slate-600 hover:bg-slate-500 text-white border-transparent' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'}`}
                >
                  <FileText size={14} />
                  <span>Sample</span>
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
                {/* Export Dropdown */}
                <div ref={exportDropdownRef} className="relative">
                  <button
                    onClick={() => setExportDropdownOpen(prev => !prev)}
                    disabled={isGeneratingPDF || isPrinting}
                    className={`px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${(isGeneratingPDF || isPrinting) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
