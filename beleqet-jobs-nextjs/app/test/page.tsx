'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

/**
 * Debug / API test page.
 * Fetches categories and jobs and displays them for manual verification.
 */
export default function TestPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testAPI();
  }, []);

  /** Calls the API to fetch categories and jobs, then stores results in state. */
  const testAPI = async () => {
    try {
      setLoading(true);
      setError('');

      // Test categories
      const catsResponse = await api.getJobCategories();
      console.log('Categories response:', catsResponse);
      setCategories(Array.isArray(catsResponse) ? catsResponse.slice(0, 5) : []);

      // Test jobs
      const jobsResponse = await api.getJobs({ limit: 10 });
      console.log('Jobs response:', jobsResponse);
      setJobs(jobsResponse.data || []);
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.message || 'API call failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold mb-6">🔍 API Debug Test</h1>

      {loading && <p className="text-blue-600 mb-4">Testing API...</p>}
      {error && <p className="text-red-600 mb-4">❌ Error: {error}</p>}

      <div className="grid gap-8">
        {/* Categories section: shows up to 5 fetched categories */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">📋 Categories ({categories.length} shown)</h2>
          {categories.length === 0 ? (
            <p className="text-gray-500">No categories loaded</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat: any) => (
                <li key={cat.id} className="text-sm bg-gray-50 p-2 rounded">
                  <strong>{cat.label || cat.name}</strong> - {cat.jobCount || 0} jobs
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Jobs section: lists fetched jobs with company, location, and type */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">💼 Jobs ({jobs.length} shown)</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs loaded</p>
          ) : (
            <ul className="space-y-3">
              {jobs.map((job: any) => (
                <li key={job.id} className="text-sm bg-gray-50 p-3 rounded border-l-4 border-green-500">
                  <div className="font-bold">{job.title}</div>
                  <div className="text-gray-600 text-xs">
                    {job.company?.name || 'Company'} • {job.location} • {job.type}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    Category ID: {job.categoryId}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Raw Data */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
          <h2 className="text-lg font-bold mb-4">📊 Raw Data (Console)</h2>
          <p className="text-sm text-gray-600">Check browser console for raw API responses (F12)</p>
          <button
            onClick={testAPI}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Test
          </button>
        </div>
      </div>
    </div>
  );
}