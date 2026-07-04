"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, type Contract } from "@/lib/api";
import { ArrowLeft, DollarSign, Calendar, CheckCircle, Clock, Upload, AlertCircle } from "lucide-react";

interface Deliverable {
  id: string;
  fileUrl: string;
  description: string;
  createdAt: string;
}

interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
  deliverables?: Deliverable[];
}

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState<string | null>(null);
  const [deliverableNote, setDeliverableNote] = useState<Record<string, string>>({});
  const [uploadedFile, setUploadedFile] = useState<Record<string, File | null>>({});

  useEffect(() => {
    const loadContract = async () => {
      try {
        // Note: This might need a specific endpoint on the backend
        setError("Contract details endpoint not yet implemented in API");
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load contract";
        setError(message);
        setLoading(false);
      }
    };

    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  const handleSubmitDeliverable = async (milestoneId: string) => {
    if (!uploadedFile[milestoneId] && !deliverableNote[milestoneId]?.trim()) {
      alert("Please upload a file or add notes");
      return;
    }

    setSubmittingMilestone(milestoneId);

    try {
      // Note: This would need a specific endpoint to submit deliverables
      // Format: POST /deliverables with milestoneId, file, and notes
      alert("Deliverable submitted successfully!");
      setDeliverableNote(prev => ({ ...prev, [milestoneId]: "" }));
      setUploadedFile(prev => ({ ...prev, [milestoneId]: null }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit deliverable");
    } finally {
      setSubmittingMilestone(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link 
          href="/dashboard/freelance" 
          className="inline-flex items-center gap-2 text-brandGreen hover:text-brandGreen/80 mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Freelancer Dashboard
        </Link>
        <div className="rounded-xl border border-redAccent/30 bg-redAccent/5 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-redAccent mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-ink">Unable to Load Contract</h2>
          <p className="text-muted mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div>
        <Link 
          href="/dashboard/freelance" 
          className="inline-flex items-center gap-2 text-brandGreen hover:text-brandGreen/80 mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Freelancer Dashboard
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
          <p className="text-ink font-semibold">Contract not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link 
        href="/dashboard/freelance" 
        className="inline-flex items-center gap-2 text-brandGreen hover:text-brandGreen/80 mb-6 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Freelancer Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Contract #{contract.id.substring(0, 8)}</h1>
        <p className="text-muted mt-2">{contract.milestones?.length || 0} milestone{contract.milestones?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Contract Status Card */}
        <div className="rounded-xl border border-border bg-white p-6">
          <p className="text-sm text-muted uppercase tracking-wide mb-2">Status</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-brandGreen" />
            <p className="text-lg font-semibold text-ink capitalize">{contract.status}</p>
          </div>
        </div>

        {/* Total Amount Card */}
        <div className="rounded-xl border border-border bg-white p-6">
          <p className="text-sm text-muted uppercase tracking-wide mb-2">Total Amount</p>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-brandGreen" />
            <p className="text-lg font-semibold text-ink">${contract.agreedAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Milestones Count Card */}
        <div className="rounded-xl border border-border bg-white p-6">
          <p className="text-sm text-muted uppercase tracking-wide mb-2">Milestones</p>
          <p className="text-lg font-semibold text-ink">{contract.milestones?.length || 0}</p>
        </div>
      </div>

      {/* Milestones */}
      {(!contract.milestones || contract.milestones.length === 0) ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
          <p className="text-ink font-semibold">No milestones</p>
          <p className="text-sm text-muted mt-1">Milestones will appear here once added</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(contract.milestones as Milestone[]).map((milestone) => (
            <div key={milestone.id} className="rounded-xl border border-border bg-white p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink">{milestone.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-2 text-brandGreen font-semibold">
                      <DollarSign className="h-4 w-4" />
                      ${milestone.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <Calendar className="h-4 w-4" />
                      Due {formatDate(milestone.dueDate)}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  milestone.status === 'completed'
                    ? 'bg-brandGreen/5 text-brandGreen'
                    : milestone.status === 'pending'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {milestone.status === 'completed' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                    </>
                  )}
                </div>
              </div>

              {/* Existing Deliverables */}
              {milestone.deliverables && milestone.deliverables.length > 0 && (
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="text-sm font-medium text-ink mb-2">Submitted Deliverables</p>
                  <div className="space-y-2">
                    {milestone.deliverables.map((deliverable) => (
                      <a
                        key={deliverable.id}
                        href={deliverable.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-brandGreen hover:underline"
                      >
                        <Upload className="h-4 w-4" />
                        {deliverable.description || 'Download File'}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Deliverable Form */}
              {milestone.status !== 'completed' && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-ink mb-3">Submit Deliverable</p>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={`file-${milestone.id}`} className="block text-xs text-muted mb-1">
                        Upload File (Optional)
                      </label>
                      <input
                        id={`file-${milestone.id}`}
                        type="file"
                        onChange={(e) => setUploadedFile(prev => ({
                          ...prev,
                          [milestone.id]: e.target.files?.[0] || null
                        }))}
                        className="block w-full text-sm border border-border rounded-lg px-3 py-2 cursor-pointer"
                        disabled={submittingMilestone === milestone.id}
                      />
                    </div>
                    <div>
                      <label htmlFor={`note-${milestone.id}`} className="block text-xs text-muted mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        id={`note-${milestone.id}`}
                        value={deliverableNote[milestone.id] || ""}
                        onChange={(e) => setDeliverableNote(prev => ({
                          ...prev,
                          [milestone.id]: e.target.value
                        }))}
                        placeholder="Add notes about this deliverable..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brandGreen resize-none"
                        disabled={submittingMilestone === milestone.id}
                      />
                    </div>
                    <button
                      onClick={() => handleSubmitDeliverable(milestone.id)}
                      disabled={submittingMilestone === milestone.id}
                      className="w-full bg-brandGreen text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brandGreen/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {submittingMilestone === milestone.id ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Submit Deliverable
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
