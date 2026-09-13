'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Outlet } from '@/lib/pitch-schemas';

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutlets = async () => {
      const res = await fetch('/api/outlets');
      if (res.ok) {
        const data = await res.json();
        setOutlets(data.outlets || []);
      }
      setLoading(false);
    };
    fetchOutlets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-48"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-slate-900"
          >
            Media Outlets
          </motion.h1>
          <Link
            href="/outlets/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Outlet
          </Link>
        </div>

        {outlets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-12 text-center"
          >
            <p className="text-slate-600 text-lg mb-4">No outlets yet</p>
            <Link href="/outlets/new" className="text-blue-600 hover:text-blue-700 font-medium">
              Add your first outlet →
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {outlets.map((outlet) => (
              <motion.div
                key={outlet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{outlet.name}</h3>
                    {outlet.website && (
                      <a
                        href={outlet.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                      >
                        {outlet.website}
                      </a>
                    )}
                    <div className="flex gap-4 mt-3 text-sm text-slate-500">
                      <span>Contacts: {outlet.contacts?.length || 0}</span>
                      {outlet.categories && outlet.categories.length > 0 && (
                        <span>Categories: {outlet.categories.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/outlets/${outlet.id}`}
                    className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
