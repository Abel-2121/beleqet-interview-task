'use client';

import { X } from 'lucide-react';
import ApplicationForm from './ApplicationForm';
import type { Application } from '@/lib/api';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  existingApplication?: Application | null;
  onSuccess?: () => void;
}

/** Modal overlay wrapping ApplicationForm for applying or editing a job application. */
export default function ApplicationModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
  existingApplication,
  onSuccess,
}: ApplicationModalProps) {
  if (!isOpen) return null;

  // Auto-close modal after success
  const handleSuccess = () => {
    onSuccess?.();
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  const isEditing = !!existingApplication;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink">
                {isEditing ? 'Edit Application' : `Apply for ${jobTitle}`}
              </h2>
              <p className="text-sm text-muted mt-1">
                {isEditing ? `Updating application for ${jobTitle}` : `at ${companyName}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-pageBg rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <ApplicationForm
            jobId={jobId}
            jobTitle={jobTitle}
            companyName={companyName}
            existingApplication={existingApplication}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}