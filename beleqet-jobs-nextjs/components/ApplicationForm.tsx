'use client';

import { useState, useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { api, type Application } from '@/lib/api';
import { uploadToCloudinary } from '@/lib/upload';

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  existingApplication?: Application | null;
  onSuccess?: () => void;
}

/** Job application form with cover letter textarea, resume upload/link, and submission handling. */
export default function ApplicationForm({
  jobId,
  jobTitle,
  companyName,
  existingApplication,
  onSuccess,
}: ApplicationFormProps) {
  const isEditing = !!existingApplication;
  const [coverLetter, setCoverLetter] = useState(existingApplication?.coverLetter || '');
  const [resumeUrl, setResumeUrl] = useState(existingApplication?.resumeUrl || '');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validate file type and size before setting
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Resume must be PDF, JPG, PNG, or WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB');
      return;
    }

    setError(null);
    setResumeFile(file);
    setResumeUrl('');
  };

  // Validate, upload resume if needed, then submit or update application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!coverLetter.trim()) {
      setError('Please enter a cover letter');
      return;
    }

    if (coverLetter.trim().length < 10) {
      setError('Cover letter must be at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);

      let finalResumeUrl = resumeUrl.trim();
      if (resumeFile) {
        setUploading(true);
        finalResumeUrl = await uploadToCloudinary(resumeFile, 'beleqet/resumes');
        setUploading(false);
      }

      if (isEditing && existingApplication) {
        await api.updateApplication(existingApplication.id, {
          coverLetter: coverLetter.trim(),
          ...(finalResumeUrl && { resumeUrl: finalResumeUrl }),
        });
      } else {
        await api.submitApplication({
          jobId,
          coverLetter: coverLetter.trim(),
          ...(finalResumeUrl && { resumeUrl: finalResumeUrl }),
        });
      }

      setSuccess(true);
      setCoverLetter('');
      setResumeUrl('');
      setResumeFile(null);

      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit application';
      setError(message);
      console.error('Failed to submit application:', err);
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  // Show success confirmation after submission
  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-green-700 mb-2">
          {isEditing ? 'Application Updated!' : 'Application Submitted!'}
        </h3>
        <p className="text-sm text-green-600">
          {isEditing
            ? `Your application for ${jobTitle} has been updated successfully.`
            : `Your application for ${jobTitle} at ${companyName} has been sent successfully.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="coverLetter" className="block text-sm font-semibold text-ink mb-2">
          Cover Letter <span className="text-red-500">*</span>
        </label>
        <textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
          rows={8}
          className="w-full px-4 py-3 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted">
            {coverLetter.length}/1000 characters
          </p>
          {coverLetter.length > 0 && coverLetter.length < 10 && (
            <p className="text-xs text-amber-600">Minimum 10 characters required</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-2">
          Resume <span className="text-xs font-normal text-muted">(Optional)</span>
        </label>

        {resumeFile ? (
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-ink">
              <FileText className="w-4 h-4 text-muted" />
              {resumeFile.name}
            </div>
            <button
              type="button"
              onClick={() => {
                setResumeFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-muted hover:text-red-500"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border rounded-xl text-sm text-muted hover:border-brandGreen hover:text-brandGreen transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload PDF or image (max 5 MB)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-muted mt-2 text-center">— or paste a link —</p>
            <div className="relative mt-2">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="url"
                id="resumeUrl"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://example.com/your-resume.pdf"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          </>
        )}
      </div>

      <div className="bg-brandGreen/5 border border-brandGreen/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-ink mb-2">Application Tips</h4>
        <ul className="text-xs text-muted space-y-1">
          <li>• Tailor your cover letter to this specific role</li>
          <li>• Highlight relevant experience and skills</li>
          <li>• Show enthusiasm for the company and position</li>
          <li>• Keep it concise but comprehensive</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !coverLetter.trim()}
        className="w-full py-3 px-4 bg-brandGreen text-white rounded-xl text-sm font-semibold hover:bg-darkGreen disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading resume...' : isSubmitting ? 'Saving...' : isEditing ? 'Update Application' : 'Submit Application'}
      </button>
    </form>
  );
}
