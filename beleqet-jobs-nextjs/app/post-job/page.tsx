/** Post a job page — multi-field form for employers to create a new job listing. */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, type JobCategory } from '@/lib/api';

/** Renders the job posting form with title, description, location, type, category, salary, and requirements. */
export default function PostJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'FULL_TIME',
    categoryId: '',
    salaryMin: '',
    salaryMax: '',
    requirements: [] as string[],
  });
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch job categories on mount
  useEffect(() => {
    api.getJobCategories().then((cats) => setCategories(Array.isArray(cats) ? cats : [])).catch(console.error);
  }, []);

  /** Updates a single form field by name. */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /** Adds the current requirement input text to the requirements list. */
  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput],
      }));
      setRequirementInput('');
    }
  };

  /** Removes a requirement by its index. */
  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  /** Submits the form — creates a job via API and redirects to dashboard. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createJob({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        jobType: formData.type,
        categoryId: formData.categoryId,
        requirements: formData.requirements,
        salaryMin: parseInt(formData.salaryMin) || undefined,
        salaryMax: parseInt(formData.salaryMax) || undefined,
      });
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Failed to post job:', error);
      alert('Failed to post job. Make sure you are logged in as an employer with a company profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pageBg py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-ink mb-8">Post a New Job</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-8 space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
              placeholder="e.g., Senior Developer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
              placeholder="Job description and responsibilities..."
            />
          </div>

          {/* Location and Job Type side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
                placeholder="e.g., Addis Ababa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Job Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          {/* Category dropdown */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Salary range fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Salary Min (ETB)</label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Salary Max (ETB)</label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
                placeholder="0"
              />
            </div>
          </div>

          {/* Requirements — add/remove list */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Requirements</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
                placeholder="Add a requirement..."
              />
              <button type="button" onClick={addRequirement} className="px-4 py-2 bg-brandGreen text-white rounded-xl text-sm font-semibold hover:bg-darkGreen">
                Add
              </button>
            </div>
            {/* Requirement tags */}
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((req, idx) => (
                <span key={idx} className="bg-brandGreen/10 text-brandGreen px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {req}
                  <button type="button" onClick={() => removeRequirement(idx)} className="font-bold">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brandGreen text-white py-3 rounded-xl font-semibold hover:bg-darkGreen transition disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
