'use client';

import { Search, MapPin, Briefcase, MapPin as LocationIcon, Heart, MessageSquare } from 'lucide-react';
import { useRef, useState, type MouseEvent } from 'react';
import { useAuth } from '@/lib/auth-context';

const TILT_BACK_DEG = 15;
const TILT_SIDE_MAX = 8;

export default function MobilePreview() {
  const [activeTab, setActiveTab] = useState('explore');
  const [isHovering, setIsHovering] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const tiltRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Abel Zeleke';
  const avatarInitial = user ? user.firstName?.[0]?.toUpperCase() : 'A';

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      rotateX: TILT_BACK_DEG + y * -4,
      rotateY: x * TILT_SIDE_MAX,
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    setTilt({ rotateX: TILT_BACK_DEG, rotateY: 0 });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      ref={tiltRef}
      className="relative [perspective:1400px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative will-change-transform"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(0)`,
          transformStyle: 'preserve-3d',
          transition: isHovering ? 'transform 0.12s ease-out' : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
      {/* Mobile Phone Frame */}
      <div className="relative aspect-[9/17] rounded-3xl bg-black p-3 shadow-2xl max-w-xs mx-auto mr-12">
        {/* Phone Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-20" />

        {/* Screen Content */}
        <div className="w-full h-full rounded-2xl bg-gradient-to-b from-pageBg to-white overflow-hidden flex flex-col font-sans">
          
          {/* Status Bar */}
          <div className="px-4 py-2 bg-white border-b border-border flex justify-between items-center text-xs font-medium text-ink">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-3 border border-ink rounded-sm" />
            </div>
          </div>

          {/* Header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-muted">Welcome back</p>
                <h2 className="text-lg font-bold text-ink">{userName}</h2>
              </div>
              <div className="w-8 h-8 rounded-full bg-brandGreen flex items-center justify-center text-white text-xs font-semibold">
                {avatarInitial}
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl p-2.5 border border-border flex items-center gap-2">
              <Search className="w-4 h-4 text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="flex-1 text-xs bg-transparent outline-none text-ink placeholder:text-muted"
                defaultValue=""
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 py-3 border-b border-border flex gap-6">
            <button
              onClick={() => setActiveTab('explore')}
              className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${
                activeTab === 'explore'
                  ? 'text-brandGreen border-brandGreen'
                  : 'text-muted border-transparent'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'text-brandGreen border-brandGreen'
                  : 'text-muted border-transparent'
              }`}
            >
              Saved
            </button>
          </div>

          {/* Content */}
          {activeTab === 'explore' && (
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Featured Badge */}
              <div className="bg-gradient-to-r from-brandGreen/10 to-brandGreen/5 rounded-xl p-3 border border-brandGreen/20">
                <p className="text-xs text-brandGreen font-semibold">✨ Featured for you</p>
              </div>

              {/* Job Card 1 */}
              <div className="bg-white rounded-xl p-3 border border-border space-y-2 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-ink">Senior Product Designer</h3>
                    <p className="text-xs text-muted">Tech Innovations Ltd</p>
                  </div>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <Heart className="w-4 h-4 text-muted hover:text-red-500 transition-colors" />
                  </button>
                </div>

                <div className="flex gap-2 text-xs text-muted">
                  <div className="flex items-center gap-1">
                    <LocationIcon className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Salary:</span>
                    <span>30-40k ETB</span>
                  </div>
                </div>

                <button className="w-full bg-brandGreen text-white text-xs font-semibold py-2 rounded-lg hover:bg-darkGreen transition-colors">
                  Apply Now
                </button>
              </div>

              {/* Job Card 2 */}
              <div className="bg-white rounded-xl p-3 border border-border space-y-2 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-ink">Full Stack Developer</h3>
                    <p className="text-xs text-muted">Digital Solutions Inc</p>
                  </div>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </button>
                </div>

                <div className="flex gap-2 text-xs text-muted">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span>Remote</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Salary:</span>
                    <span>25-35k ETB</span>
                  </div>
                </div>

                <button className="w-full bg-brandGreen text-white text-xs font-semibold py-2 rounded-lg hover:bg-darkGreen transition-colors">
                  Apply Now
                </button>
              </div>

              {/* Job Card 3 */}
              <div className="bg-white rounded-xl p-3 border border-border space-y-2 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-ink">Content Marketing Manager</h3>
                    <p className="text-xs text-muted">Creative Media Co</p>
                  </div>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <Heart className="w-4 h-4 text-muted hover:text-red-500 transition-colors" />
                  </button>
                </div>

                <div className="flex gap-2 text-xs text-muted">
                  <div className="flex items-center gap-1">
                    <LocationIcon className="w-3 h-3" />
                    <span>Hybrid</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Salary:</span>
                    <span>20-25k ETB</span>
                  </div>
                </div>

                <button className="w-full bg-brandGreen text-white text-xs font-semibold py-2 rounded-lg hover:bg-darkGreen transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center justify-center text-center">
              <Heart className="w-8 h-8 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-ink mb-1">No saved jobs yet</p>
              <p className="text-xs text-muted">Start saving jobs to view them here</p>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="border-t border-border bg-white px-4 py-2 flex justify-around">
            <button className="flex flex-col items-center gap-1 py-1.5 px-4 rounded-lg hover:bg-gray-50 transition-colors">
              <Search className="w-5 h-5 text-brandGreen" />
              <span className="text-xs text-brandGreen font-semibold">Explore</span>
            </button>
            <button className="flex flex-col items-center gap-1 py-1.5 px-4 rounded-lg hover:bg-gray-50 transition-colors">
              <Heart className="w-5 h-5 text-muted" />
              <span className="text-xs text-muted">Saved</span>
            </button>
            <button className="flex flex-col items-center gap-1 py-1.5 px-4 rounded-lg hover:bg-gray-50 transition-colors">
              <MessageSquare className="w-5 h-5 text-muted" />
              <span className="text-xs text-muted">Messages</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification Card */}
      <div className="absolute -bottom-12 -right-6 w-48 bg-white rounded-2xl border border-border p-3 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-brandGreen/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-brandGreen" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-ink">New Match!</p>
            <p className="text-xs text-muted">Design Manager position</p>
            <p className="text-xs text-muted mt-0.5">Tap to learn more</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
