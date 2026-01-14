import { useState } from 'react'
import { useResumeStore } from './store'
import { BasicsForm } from './components/BasicsForm'
import { WorkForm } from './components/WorkForm'
import { EducationForm } from './components/EducationForm'
import { SkillsForm } from './components/SkillsForm'
import { ProjectsForm } from './components/ProjectsForm'
import { AwardsForm } from './components/AwardsForm'
import { FormattingForm } from './components/FormattingForm'
import { TemplateRenderer } from './templates/TemplateRenderer'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { TemplateId } from './types'
import './index.css'

type TabKey = 'basics' | 'work' | 'education' | 'skills' | 'projects' | 'awards' | 'templates' | 'formatting';

const templates: Array<{ id: TemplateId; name: string; icon: string }> = [
  { id: 1, name: 'Classic', icon: '📄' },
  { id: 2, name: 'Modern', icon: '✨' },
  { id: 4, name: 'Technical', icon: '⚙️' },
  { id: 8, name: 'Executive', icon: '💼' },
];

function App() {
  const { resumeData, setTemplate, loadSampleData, reset } = useResumeStore()
  const [activeTab, setActiveTab] = useState<TabKey>('templates')
  const [previewScale, setPreviewScale] = useState(0.75)

  const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: 'templates', label: 'Template', icon: '📐' },
    { key: 'basics', label: 'Profile', icon: '👤' },
    { key: 'work', label: 'Experience', icon: '💼' },
    { key: 'education', label: 'Education', icon: '🎓' },
    { key: 'skills', label: 'Skills', icon: '⚡' },
    { key: 'projects', label: 'Projects', icon: '🚀' },
    { key: 'awards', label: 'Awards', icon: '🏆' },
    { key: 'formatting', label: 'Formatting', icon: '🎨' },
  ]

  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) {
      alert('Resume preview not found! Please try again.');
      return;
    }

    const button = document.activeElement as HTMLButtonElement;
    const originalText = button?.textContent;
    if (button) button.textContent = '⏳ Generating...';

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));

      const scaledWidth = imgWidth * 0.264583 * ratio;
      const scaledHeight = imgHeight * 0.264583 * ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, scaledWidth, scaledHeight);

      const fileName = `${resumeData.basics.name || 'resume'}.pdf`.replace(/[^a-z0-9-_\.]/gi, '_');
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      const err = error as Error;
      alert(`PDF failed: ${err.message || 'Unknown error'}`);
    } finally {
      if (button && originalText) button.textContent = originalText;
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Main Content - NO HEADER */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar - Tabs */}
        <aside className="w-56 bg-slate-100 border-r-4 border-slate-300 flex-shrink-0">
          <div className="sticky top-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  w-full flex items-center gap-3 px-4 py-4 font-bold transition-all border-l-4
                  ${activeTab === tab.key
                    ? 'bg-indigo-600 text-white border-indigo-900 shadow-lg'
                    : 'bg-slate-100 text-black border-transparent hover:bg-slate-200 hover:border-indigo-300'
                  }
                `}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center - Form Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-white">
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
                <h3 className="text-lg font-bold text-black">Choose Template</h3>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setTemplate(template.id)}
                      className={`
                        p-6 rounded-xl border-4 transition-all text-center
                        ${resumeData.selectedTemplate === template.id
                          ? 'border-indigo-600 bg-indigo-50 shadow-xl'
                          : 'border-slate-300 bg-white hover:border-indigo-300 hover:shadow-lg'
                        }
                      `}
                    >
                      <div className="text-5xl mb-2">{template.icon}</div>
                      <div className="font-bold text-black text-lg">{template.name}</div>
                      <div className="text-sm text-slate-600 font-semibold mt-1">Template {template.id}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right - Live Preview */}
        <aside className="w-[900px] bg-slate-50 border-l-4 border-slate-300 flex-shrink-0">
          <div className="sticky top-0 h-screen flex flex-col">
            {/* Preview Header with Buttons */}
            <div className="p-3 bg-indigo-700 text-white border-b-4 border-indigo-900 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewScale(Math.max(0.4, previewScale - 0.05))}
                  className="px-3 py-1 text-sm bg-white text-indigo-700 hover:bg-indigo-50 rounded font-bold"
                >
                  −
                </button>
                <span className="px-3 py-1 text-sm bg-indigo-800 rounded font-bold">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={() => setPreviewScale(Math.min(1, previewScale + 0.05))}
                  className="px-3 py-1 text-sm bg-white text-indigo-700 hover:bg-indigo-50 rounded font-bold"
                >
                  +
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadSampleData}
                  className="px-3 py-1.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded text-xs font-bold transition-colors"
                >
                  📋 Load Sample
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors"
                >
                  🗑️ Reset
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all shadow-lg"
                >
                  📥 Download PDF
                </button>
              </div>
            </div>

            {/* Preview Content - ALWAYS FULL A4 SIZE */}
            <div className="flex-1 p-6 overflow-auto bg-slate-200">
              <div
                id="resume-preview"
                className="bg-white shadow-xl mx-auto border-4 border-slate-400"
                style={{
                  transform: `scale(${previewScale})`,
                  width: '816px',  /* 8.5" at 96 DPI */
                  minHeight: '1056px', /* 11" at 96 DPI */
                  transformOrigin: 'top center',
                  marginBottom: `${1056 * previewScale * 0.1}px`
                }}
              >
                <TemplateRenderer templateId={resumeData.selectedTemplate} />
              </div>
            </div>

            {/* Preview Footer */}
            <div className="p-3 bg-green-100 border-t-4 border-green-300">
              <p className="text-sm text-black font-bold text-center">
                ✅ Full A4 Page (8.5" × 11") • Updates Live!
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App

