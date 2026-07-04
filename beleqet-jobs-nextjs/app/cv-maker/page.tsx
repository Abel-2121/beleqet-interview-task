'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, GripVertical, Download, FileText, ChevronDown, ChevronUp, Sparkles, Loader } from 'lucide-react';
import { api } from '@/lib/api';

interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface CVData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  portfolio: string;
  linkedin: string;
  github: string;
}

const emptyCV: CVData = {
  firstName: '', lastName: '', email: '', phone: '', location: '',
  title: '', summary: '',
  experience: [],
  education: [],
  skills: [],
  portfolio: '', linkedin: '', github: '',
};

const STORAGE_KEY = 'beleqet-cv-data';

function id() { return Math.random().toString(36).slice(2, 9); }

export default function CvMakerPage() {
  const [data, setData] = useState<CVData>(emptyCV);
  const [loaded, setLoaded] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [improvingId, setImprovingId] = useState<string | null>(null);
  const [suggestingSkills, setSuggestingSkills] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData({ ...emptyCV, ...JSON.parse(saved) });
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  const patch = useCallback((partial: Partial<CVData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await api.generateCvSummary({
        title: data.title,
        skills: data.skills,
        experience: data.experience.map(e => ({ role: e.role, company: e.company, description: e.description })),
      });
      if (res.summary) patch({ summary: res.summary });
    } catch { /* ignore */ }
    setGeneratingSummary(false);
  };

  const handleImproveDescription = async (id: string) => {
    const exp = data.experience.find(e => e.id === id);
    if (!exp || !exp.description.trim()) return;
    setImprovingId(id);
    try {
      const res = await api.improveDescription({ role: exp.role, company: exp.company, description: exp.description });
      if (res.improved) updateExperience(id, 'description', res.improved);
    } catch { /* ignore */ }
    setImprovingId(null);
  };

  const handleSuggestSkills = async () => {
    setSuggestingSkills(true);
    try {
      const res = await api.suggestSkills({
        title: data.title,
        experience: data.experience.map(e => ({ role: e.role, company: e.company, description: e.description })),
      });
      if (res.skills.length) {
        const existing = new Set(data.skills);
        const newSkills = res.skills.filter(s => !existing.has(s));
        if (newSkills.length) setData(prev => ({ ...prev, skills: [...prev.skills, ...newSkills] }));
      }
    } catch { /* ignore */ }
    setSuggestingSkills(false);
  };

  const addExperience = () => {
    const exp: Experience = { id: id(), company: '', role: '', startDate: '', endDate: '', current: false, description: '' };
    setData(prev => ({ ...prev, experience: [...prev.experience, exp] }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const addEducation = () => {
    const edu: Education = { id: id(), school: '', degree: '', field: '', startDate: '', endDate: '', current: false };
    setData(prev => ({ ...prev, education: [...prev.education, edu] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !data.skills.includes(s)) {
      setData(prev => ({ ...prev, skills: [...prev.skills, s] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const clearAll = () => {
    if (confirm('Clear all CV data?')) {
      setData(emptyCV);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const inputClass = "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-brandGreen focus:ring-2 focus:ring-brandGreen/20 transition-colors";
  const labelClass = "block text-sm font-semibold text-ink mb-1.5";
  const sectionTitle = "text-sm font-bold text-ink tracking-wide uppercase";

  if (!loaded) {
    return <div className="container-page py-20 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="bg-gradient-to-r from-brandGreen to-darkGreen py-10 text-white">
        <div className="container-page">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">CV Maker</h1>
              <p className="text-sm text-white/80 mt-0.5">Build a professional CV in minutes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Form */}
          <div className="xl:col-span-3 space-y-6">
            {/* Personal Info */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className={sectionTitle}>Personal Information</h2>
              <div className="h-px bg-border my-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input className={inputClass} value={data.firstName} onChange={e => patch({ firstName: e.target.value })} placeholder="John" />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input className={inputClass} value={data.lastName} onChange={e => patch({ lastName: e.target.value })} placeholder="Doe" />
                </div>
                <div>
                  <label className={labelClass}>Professional Title</label>
                  <input className={inputClass} value={data.title} onChange={e => patch({ title: e.target.value })} placeholder="Software Engineer" />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input className={inputClass} value={data.location} onChange={e => patch({ location: e.target.value })} placeholder="Addis Ababa, Ethiopia" />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input className={inputClass} type="email" value={data.email} onChange={e => patch({ email: e.target.value })} placeholder="john@example.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} type="tel" value={data.phone} onChange={e => patch({ phone: e.target.value })} placeholder="+251 91 234 5678" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass + " mb-0"}>Professional Summary</label>
                  <button onClick={handleGenerateSummary} disabled={generatingSummary} className="inline-flex items-center gap-1 text-xs font-semibold text-brandGreen hover:text-darkGreen transition-colors disabled:opacity-50">
                    {generatingSummary ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {generatingSummary ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
                <textarea className={inputClass + " resize-none"} rows={4} value={data.summary} onChange={e => patch({ summary: e.target.value })} placeholder="Brief overview of your career, key strengths, and career goals…" />
              </div>
            </div>

            {/* Experience */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className={sectionTitle}>Work Experience</h2>
                <button onClick={addExperience} className="inline-flex items-center gap-1.5 rounded-full bg-brandGreen px-4 py-1.5 text-xs font-semibold text-white hover:bg-darkGreen transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <div className="h-px bg-border my-4" />
              {data.experience.length === 0 && <p className="text-sm text-muted text-center py-6">No experience added yet. Click &quot;Add&quot; to begin.</p>}
              <div className="space-y-4">
                {data.experience.map(exp => (
                  <div key={exp.id} className="rounded-xl border border-border bg-pageBg/50 p-4 relative group">
                    <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all" title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-muted mb-1">Company</label>
                        <input className={inputClass} value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company name" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">Role</label>
                        <input className={inputClass} value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} placeholder="Job title" />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-muted mb-1">Start</label>
                          <input className={inputClass} type="month" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-muted mb-1">{exp.current ? 'End' : 'End'}</label>
                          <input className={inputClass} type="month" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} disabled={exp.current} />
                        </div>
                        <label className="flex items-center gap-1.5 pb-1 text-xs text-muted cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} className="rounded border-border text-brandGreen focus:ring-brandGreen" />
                          Current
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-muted">Description</label>
                          <button onClick={() => handleImproveDescription(exp.id)} disabled={improvingId === exp.id || !exp.description.trim()} className="inline-flex items-center gap-1 text-[10px] font-semibold text-brandGreen hover:text-darkGreen transition-colors disabled:opacity-50">
                            {improvingId === exp.id ? <Loader className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            {improvingId === exp.id ? 'Improving...' : 'Improve with AI'}
                          </button>
                        </div>
                        <textarea className={inputClass + " resize-none"} rows={3} value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} placeholder="Key responsibilities and achievements…" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className={sectionTitle}>Education</h2>
                <button onClick={addEducation} className="inline-flex items-center gap-1.5 rounded-full bg-brandGreen px-4 py-1.5 text-xs font-semibold text-white hover:bg-darkGreen transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <div className="h-px bg-border my-4" />
              {data.education.length === 0 && <p className="text-sm text-muted text-center py-6">No education added yet.</p>}
              <div className="space-y-4">
                {data.education.map(edu => (
                  <div key={edu.id} className="rounded-xl border border-border bg-pageBg/50 p-4 relative group">
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all" title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-muted mb-1">School / Institution</label>
                        <input className={inputClass} value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} placeholder="University name" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">Degree</label>
                        <input className={inputClass} value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor's" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">Field of Study</label>
                        <input className={inputClass} value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} placeholder="Computer Science" />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-muted mb-1">Start</label>
                          <input className={inputClass} type="month" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-muted mb-1">{edu.current ? 'End' : 'End'}</label>
                          <input className={inputClass} type="month" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} disabled={edu.current} />
                        </div>
                        <label className="flex items-center gap-1.5 pb-1 text-xs text-muted cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={edu.current} onChange={e => updateEducation(edu.id, 'current', e.target.checked)} className="rounded border-border text-brandGreen focus:ring-brandGreen" />
                          Current
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className={sectionTitle}>Skills</h2>
              <div className="h-px bg-border my-4" />
              <div className="flex gap-2 mb-3">
                <input className={inputClass + " flex-1"} value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Type a skill and press Enter…" />
                <button onClick={addSkill} className="shrink-0 rounded-xl bg-brandGreen px-4 text-sm font-semibold text-white hover:bg-darkGreen transition-colors">Add</button>
                <button onClick={handleSuggestSkills} disabled={suggestingSkills} className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-brandGreen px-4 text-sm font-semibold text-brandGreen hover:bg-brandGreen/5 transition-colors disabled:opacity-50">
                  {suggestingSkills ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {suggestingSkills ? 'Suggesting...' : 'AI Suggest'}
                </button>
              </div>
              {data.skills.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No skills added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1.5 rounded-full bg-brandGreen/10 px-3 py-1.5 text-xs font-medium text-brandGreen">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className={sectionTitle}>Links</h2>
              <div className="h-px bg-border my-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Portfolio URL</label>
                  <input className={inputClass} value={data.portfolio} onChange={e => patch({ portfolio: e.target.value })} placeholder="https://your-portfolio.com" />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input className={inputClass} value={data.linkedin} onChange={e => patch({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className={labelClass}>GitHub</label>
                  <input className={inputClass} value={data.github} onChange={e => patch({ github: e.target.value })} placeholder="https://github.com/..." />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button onClick={clearAll} className="text-sm text-muted hover:text-red-500 transition-colors">Clear all data</button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-brandGreen px-6 py-2.5 text-sm font-semibold text-white hover:bg-darkGreen transition-colors shadow-sm">
                <Download className="h-4 w-4" /> Download CV (PDF)
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="xl:col-span-2">
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden sticky top-24">
              <button onClick={() => setPreviewOpen(!previewOpen)} className="flex w-full items-center justify-between bg-gradient-to-r from-brandGreen to-darkGreen px-5 py-3 text-white">
                <span className="text-sm font-semibold">Live Preview</span>
                {previewOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {previewOpen && (
                <div className="p-6" id="cv-preview">
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-extrabold text-ink">{(data.firstName || data.lastName) ? `${data.firstName} ${data.lastName}` : 'Your Name'}</h2>
                    {data.title && <p className="text-sm text-brandGreen font-semibold mt-0.5">{data.title}</p>}
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-xs text-muted">
                      {data.email && <span>{data.email}</span>}
                      {data.phone && <span>{data.phone}</span>}
                      {data.location && <span>{data.location}</span>}
                    </div>
                    {(data.linkedin || data.github || data.portfolio) && (
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 text-xs text-brandGreen">
                        {data.linkedin && <span>{data.linkedin.replace(/^https?:\/\//, '')}</span>}
                        {data.github && <span>{data.github.replace(/^https?:\/\//, '')}</span>}
                        {data.portfolio && <span>{data.portfolio.replace(/^https?:\/\//, '')}</span>}
                      </div>
                    )}
                  </div>

                  {data.summary && (
                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-1.5">Summary</h3>
                      <p className="text-xs text-muted leading-relaxed">{data.summary}</p>
                    </div>
                  )}

                  {data.experience.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 border-b border-border pb-1">Experience</h3>
                      <div className="space-y-3">
                        {data.experience.map(exp => (
                          <div key={exp.id}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-bold text-ink">{exp.role || 'Role'}</p>
                                <p className="text-xs text-muted">{exp.company || 'Company'}</p>
                              </div>
                              <p className="text-[10px] text-muted whitespace-nowrap">
                                {exp.startDate || 'Start'} – {exp.current ? 'Present' : exp.endDate || 'End'}
                              </p>
                            </div>
                            {exp.description && <p className="text-xs text-muted mt-1 leading-relaxed">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.education.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 border-b border-border pb-1">Education</h3>
                      <div className="space-y-2">
                        {data.education.map(edu => (
                          <div key={edu.id}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-bold text-ink">{edu.school || 'School'}</p>
                                <p className="text-xs text-muted">{edu.degree || 'Degree'}{edu.field ? ` in ${edu.field}` : ''}</p>
                              </div>
                              <p className="text-[10px] text-muted whitespace-nowrap">
                                {edu.startDate || 'Start'} – {edu.current ? 'Present' : edu.endDate || 'End'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.skills.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 border-b border-border pb-1">Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.map(skill => (
                          <span key={skill} className="rounded-md bg-pageBg px-2 py-0.5 text-[10px] font-medium text-ink">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!data.firstName && !data.lastName && data.experience.length === 0 && data.education.length === 0 && data.skills.length === 0 && !data.summary && (
                    <p className="text-xs text-muted text-center py-8">Fill in your details on the left to see your CV preview here.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
