import { useState, useEffect } from 'react'
import { useResumeStore } from './store'
import { BasicsForm } from './components/forms/BasicsForm'
import { WorkForm } from './components/forms/WorkForm'
import { EducationForm } from './components/forms/EducationForm'
import { SkillsForm } from './components/forms/SkillsForm'
import { ProjectsForm } from './components/forms/ProjectsForm'
import { AwardsForm } from './components/forms/AwardsForm'
import { FormattingForm } from './components/forms/FormattingForm'
import { TemplateThumbnail } from './components/preview/TemplateThumbnail'
import { PDFPreview } from './components/preview/PDFPreview'
import type { TemplateId, SectionKey } from './types'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { saveResumeData, loadResumeData, exportToJSON, importFromJSON, saveDarkMode, loadDarkMode } from './lib/storage'
import { pdf } from '@react-pdf/renderer'
import { ClassicPDFTemplate } from './templates/pdf/ClassicPDFTemplate'
import { ModernPDFTemplate } from './templates/pdf/ModernPDFTemplate'
import './styles/index.css'

// Tab system types
type TabKey = 'basics' | 'work' | 'education' | 'skills' | 'projects' | 'awards' | 'templates' | 'formatting';

interface TabItem {
  key: TabKey;
  label: string;
  icon: string;
  draggable?: boolean;
  sectionKey?: SectionKey;
}

const templates: Array<{ id: TemplateId; name: string; icon: string }> = [
  { id: 1, name: 'Classic', icon: '📄' },
  { id: 2, name: 'Modern', icon: '✨' },
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
        w-full flex items-center gap-3 px-4 py-3 font-bold transition-all border-l-4
        ${isActive
          ? 'bg-indigo-600 text-white border-indigo-900 shadow-lg'
          : 'bg-slate-50 text-black border-transparent hover:bg-slate-200 hover:border-indigo-300 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800'
        }
      `}
    >
      {tab.draggable && (
        <span {...attributes} {...listeners} className="cursor-move text-slate-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
          ☰
        </span>
      )}
      <span className="text-xl">{tab.icon}</span>
      <span className="text-sm">{tab.label}</span>
    </button>
  );
}

function App() {
  const { resumeData, setTemplate, setSections, loadSampleData, reset } = useResumeStore()
  const [activeTab, setActiveTab] = useState<TabKey>('templates')
  const [darkMode, setDarkMode] = useState(false)

  // Load saved data and dark mode on mount
  useEffect(() => {
    const savedData = loadResumeData();
    if (savedData) {
      // Stripping duplicates on load for safety
      if (savedData.sections) {
        savedData.sections = Array.from(new Set(savedData.sections));
      }
      useResumeStore.setState({ resumeData: savedData });
    }
    setDarkMode(loadDarkMode());
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveResumeData(resumeData);
    }, 30000);
    return () => clearInterval(interval);
  }, [resumeData]);

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
    const tabMap: Record<SectionKey, TabItem> = {
      profile: { key: 'basics', label: 'Profile', icon: '👤', draggable: false },
      work: { key: 'work', label: 'Experience', icon: '💼', draggable: true, sectionKey: 'work' },
      education: { key: 'education', label: 'Education', icon: '🎓', draggable: true, sectionKey: 'education' },
      skills: { key: 'skills', label: 'Skills', icon: '⚡', draggable: true, sectionKey: 'skills' },
      projects: { key: 'projects', label: 'Projects', icon: '🚀', draggable: true, sectionKey: 'projects' },
      awards: { key: 'awards', label: 'Awards', icon: '🏆', draggable: true, sectionKey: 'awards' },
    };
    return tabMap[sectionKey];
  });

  // Flat tab list
  const settingsTabs: TabItem[] = [
    { key: 'templates', label: 'Template', icon: '📐', draggable: false },
    { key: 'formatting', label: 'Formatting', icon: '🎨', draggable: false },
  ];

  const allTabs = [...settingsTabs, ...sectionTabs];

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
    const button = document.activeElement as HTMLButtonElement;
    const originalText = button?.textContent;
    if (button) button.textContent = '⏳ Generating...';

    try {
      let templateComponent;
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

      const blob = await pdf(templateComponent).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${resumeData.basics.name || 'resume'}.pdf`.replace(/[^a-z0-9._-]/gi, '_');
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      if (button && originalText) button.textContent = originalText;
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-black' : 'bg-white'}`}>
      <div className="flex-1 flex w-full">
        <aside className={`w-56 flex-shrink-0 border-r-4 ${darkMode ? 'bg-black border-gray-600' : 'bg-slate-100 border-slate-300'}`}>
          <div className="sticky top-0">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} >
              <SortableContext items={allTabs.map(t => t.key)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col">
                  {allTabs.map((tab) => (
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

        <main className={`flex-1 p-6 overflow-y-auto ${darkMode ? 'bg-black text-white' : 'bg-white'}`}>
          <div className="w-full max-w-5xl mx-auto">
            {activeTab === 'basics' && <BasicsForm />}
            {activeTab === 'work' && <WorkForm />}
            {activeTab === 'education' && <EducationForm />}
            {activeTab === 'skills' && <SkillsForm />}
            {activeTab === 'projects' && <ProjectsForm />}
            {activeTab === 'awards' && <AwardsForm />}
            {activeTab === 'formatting' && <FormattingForm />}
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Choose Template</h3>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setTemplate(template.id)}
                      className={`
                        group relative flex flex-col overflow-hidden rounded-xl border-4 transition-all
                        ${resumeData.selectedTemplate === template.id
                          ? 'border-indigo-600 ring-4 ring-indigo-600/20'
                          : darkMode
                            ? 'border-gray-600 bg-black hover:border-indigo-400'
                            : 'border-slate-300 bg-white hover:border-indigo-400'
                        }
                      `}
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-white border-b-2 border-slate-200 dark:border-gray-800">
                        <TemplateThumbnail templateId={template.id} />
                        {resumeData.selectedTemplate === template.id && (
                          <div className="absolute inset-0 border-8 border-indigo-600/30 pointer-events-none"></div>
                        )}
                      </div>

                      <div className={`
                        p-4 text-left transition-colors relative
                        ${resumeData.selectedTemplate === template.id
                          ? 'bg-indigo-600'
                          : darkMode
                            ? 'bg-black'
                            : 'bg-white'
                        }
                      `}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`font-bold text-lg leading-tight ${resumeData.selectedTemplate === template.id ? 'text-white' : darkMode ? 'text-white' : 'text-black'
                              }`}>
                              {template.name}
                            </div>
                            <div className={`text-xs font-bold mt-0.5 uppercase tracking-wider ${resumeData.selectedTemplate === template.id ? 'text-indigo-100' : darkMode ? 'text-gray-400' : 'text-slate-500'
                              }`}>
                              TEMPLATE 0{template.id}
                            </div>
                          </div>
                          {resumeData.selectedTemplate === template.id && (
                            <div className="bg-white text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                              <span className="text-sm font-bold">✓</span>
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

        <aside className={`w-[900px] border-l-4 flex-shrink-0 ${darkMode ? 'bg-black border-gray-600' : 'bg-slate-50 border-slate-300'}`}>
          <div className="sticky top-0 h-screen flex flex-col">
            <div className={`p-3 border-b-4 flex justify-between items-center ${darkMode ? 'bg-black border-gray-600' : 'bg-indigo-700 border-indigo-900'} text-white`}>
              <div className="text-sm font-bold">📄 Live PDF Preview</div>
              <div className="flex gap-2">
                <button
                  onClick={toggleDarkMode}
                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded text-xs font-bold transition-colors"
                  title="Toggle Dark Mode"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={handleImport}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors"
                >📁 Import</button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold transition-colors"
                >💾 Export</button>
                <button
                  onClick={loadSampleData}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}
                >📋 Load Sample</button>
                <button
                  onClick={reset}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors"
                >🗑️ Reset</button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all shadow-lg"
                >📥 Download PDF</button>
              </div>
            </div>

            <div className={`flex-1 overflow-hidden ${darkMode ? 'bg-black' : 'bg-slate-200'}`}>
              <PDFPreview templateId={resumeData.selectedTemplate} />
            </div>

            <div className={`p-3 border-t-4 ${darkMode ? 'bg-black border-gray-600' : 'bg-green-100 border-green-300'}`}>
              <p className={`text-sm font-bold text-center ${darkMode ? 'text-white' : 'text-black'}`}>
                ✅ True WYSIWYG PDF Preview (Letter 8.5" × 11") • Powered by @react-pdf/renderer
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
