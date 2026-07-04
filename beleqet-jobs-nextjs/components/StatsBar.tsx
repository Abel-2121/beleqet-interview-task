'use client';

import { useEffect, useState, useRef } from 'react';
import { Briefcase, Building2, Users, Smile, type LucideIcon } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { api } from '@/lib/api';
import { staggerContainer, staggerItem } from '@/lib/motion';

const iconMap: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  'building-2': Building2,
  users: Users,
  smile: Smile,
};

export default function StatsBar() {
  const [stats, setStats] = useState([
    { label: 'Live Jobs', value: '—', icon: 'briefcase' },
    { label: 'Companies', value: '—', icon: 'building-2' },
    { label: 'Candidates', value: '—', icon: 'users' },
    { label: 'Applications', value: '—', icon: 'smile' },
  ]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    api.getJobStats()
      .then((data) => {
        setStats([
          { label: 'Live Jobs', value: data.jobs.toLocaleString(), icon: 'briefcase' },
          { label: 'Companies', value: data.companies.toLocaleString(), icon: 'building-2' },
          { label: 'Candidates', value: data.candidates.toLocaleString(), icon: 'users' },
          { label: 'Applications', value: data.applications.toLocaleString(), icon: 'smile' },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="container-page -mt-7 relative z-10">
      <motion.div
        ref={ref}
        className="rounded-2xl bg-brandGreen text-white grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/15 shadow-cardHover overflow-hidden"
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        variants={staggerContainer}
      >
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon] ?? Briefcase;
          return (
            <motion.div
              key={stat.label}
              className="flex items-center gap-3 px-5 py-5"
              variants={staggerItem}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: 0.2 + index * 0.08, type: 'spring', stiffness: 200, damping: 16 }}
              >
                <Icon className="h-5 w-5 text-white/80 shrink-0" />
              </motion.div>
              <div>
                <p className="text-lg font-extrabold leading-none">{stat.value}</p>
                <p className="text-[11px] text-white/70 mt-1">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
