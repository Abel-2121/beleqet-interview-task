'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, type User } from '@/lib/api';
import { User as UserIcon, Building2, Globe, MapPin, Phone, Mail, Save, Upload, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    skills: [] as string[],
    portfolioUrl: '',
    resumeUrl: '',
  });

  const [companyData, setCompanyData] = useState({
    name: '',
    logoUrl: '',
    website: '',
    description: '',
    industry: '',
    size: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        skills: user.skills || [],
        portfolioUrl: user.portfolioUrl || '',
        resumeUrl: user.resumeUrl || '',
      });

      if (user.company) {
        setCompanyData({
          name: user.company.name || '',
          logoUrl: user.company.logoUrl || '',
          website: user.company.website || '',
          description: user.company.description || '',
          industry: user.company.industry || '',
          size: user.company.size || '',
        });
      }
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updatedUser = await api.updateProfile(formData);
      updateUser(updatedUser);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!companyData.name) {
      alert('Company name is required');
      return;
    }

    try {
      setSaving(true);
      await api.createCompany(companyData);
      // Refresh user data to get updated company info
      const updatedUser = await api.getProfile();
      updateUser(updatedUser);
      alert('Company profile updated successfully!');
    } catch (error) {
      console.error('Failed to update company:', error);
      alert('Failed to update company profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-brandGreen to-darkGreen rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="mt-2 opacity-90">
          Manage your personal information and preferences.
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-brandGreen/10 flex items-center justify-center">
            <UserIcon className="w-7 h-7 text-brandGreen" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">Personal Information</h2>
            <p className="text-sm text-muted">Your basic profile details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-ink mb-2">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-muted mt-1">Email cannot be changed</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-ink mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
              className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent resize-none"
            />
          </div>

          {user.role === 'JOB_SEEKER' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Resume URL
                </label>
                <input
                  type="url"
                  value={formData.resumeUrl}
                  onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                  placeholder="https://drive.google.com/your-resume.pdf"
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                />
              </div>
            </>
          )}

          {user.role === 'JOB_SEEKER' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-ink mb-2">
                Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill and press Enter"
                  className="flex-1 px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-3 bg-brandGreen text-white rounded-lg text-sm font-semibold hover:bg-darkGreen transition-colors"
                >
                  Add
                </button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-2 bg-brandGreen/10 text-brandGreen px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8 pt-8 border-t border-border">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-brandGreen text-white rounded-xl font-semibold hover:bg-darkGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Company Information (for employers) */}
      {user.role === 'EMPLOYER' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-brandGreen/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-brandGreen" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink">Company Information</h2>
              <p className="text-sm text-muted">Your company details for job postings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => handleCompanyChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Website
              </label>
              <input
                type="url"
                value={companyData.website}
                onChange={(e) => handleCompanyChange('website', e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Industry
              </label>
              <input
                type="text"
                value={companyData.industry}
                onChange={(e) => handleCompanyChange('industry', e.target.value)}
                placeholder="e.g. Technology, Finance, Healthcare"
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Company Size
              </label>
              <select
                value={companyData.size}
                onChange={(e) => handleCompanyChange('size', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-ink mb-2">
                Company Logo URL
              </label>
              <input
                type="url"
                value={companyData.logoUrl}
                onChange={(e) => handleCompanyChange('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-ink mb-2">
                Company Description
              </label>
              <textarea
                value={companyData.description}
                onChange={(e) => handleCompanyChange('description', e.target.value)}
                rows={4}
                placeholder="Describe your company, culture, and what makes it a great place to work..."
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end mt-8 pt-8 border-t border-border">
            <button
              onClick={handleSaveCompany}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-brandGreen text-white rounded-xl font-semibold hover:bg-darkGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Company'}
            </button>
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
        <h3 className="text-xl font-semibold text-ink mb-6">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-muted mb-1">Account Type</p>
            <p className="font-semibold text-ink capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-muted mb-1">Member Since</p>
            <p className="font-semibold text-ink">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}