'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

interface FreelanceGigDetail {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  skills: string[];
  experienceLevel: string;
  bidCount: number;
  clientName: string;
  status: string;
}

export default function FreelanceDetailPage() {
  const params = useParams();
  const gigId = params.id as string;
  const [gig, setGig] = useState<FreelanceGigDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gigId) {
      fetchGig();
    }
  }, [gigId]);

  const fetchGig = async () => {
    try {
      setLoading(true);
      const response = await api.getFreelanceGig(gigId);
      setGig(response.data);
    } catch (error) {
      console.error('Failed to load gig:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Gig not found</h1>
          <Link href="/freelance" className="text-blue-600 hover:underline">
            Back to gigs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/freelance" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Gigs
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{gig.title}</h1>
            <p className="text-gray-600">Posted by {gig.clientName}</p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {gig.budgetMin.toLocaleString()} - {gig.budgetMax.toLocaleString()} ETB
            </p>
            <p className="text-gray-600 mt-2">
              Deadline: {new Date(gig.deadline).toLocaleDateString()}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{gig.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {gig.skills?.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Experience Level</h2>
            <p className="text-gray-700">{gig.experienceLevel}</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">{gig.bidCount} freelancers have already bid</p>
          </div>

          <div className="flex gap-4">
            <Link 
              href={`/freelance/${gigId}/bid`}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition"
            >
              Submit Your Bid
            </Link>
            <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
              Save Gig
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
