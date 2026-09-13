'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Pitch } from '@/lib/pitch-schemas';

export default function PitchesPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchPitches = async () => {
      const res = await fetch('/api/pitches');
      if (res.ok) {
        const data = await res.json();
        setPitches(data.pitches || []);
      }
      setLoading(false);
    };
    fetchPitches();
  }, []);

  const filtered =
    filterStatus === 'all' ? pitches : pitches.filter((p) => p.status === filterStatus);

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-900',
    sent: 'bg-blue-100 text-blue-900',
    responded: 'bg-green-100 text-green-900',
    bounced: 'bg-red-100 text-red-900',
    no_response: 'bg-amber-100 text-amber-900',
  };

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
            Pitches
          </motion.h1>
          <Link
            href="/pitches/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Pitch
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex gap-2 flex-wrap"
        >
          {['all', 'draft', 'sent', 'responded', 'bounced', 'no_response'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </motion.div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-12 text-center"
          >
            <p className="text-slate-600 text-lg mb-4">
              {filterStatus === 'all' ? 'No pitches yet' : `No ${filterStatus} pitches`}
            </p>
            <Link href="/pitches/new" className="text-blue-600 hover:text-blue-700 font-medium">
              Create your first pitch →
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filtered.map((pitch) => (
              <motion.div
                key={pitch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{pitch.subject}</h3>
                    <p className="text-slate-600 mt-1">To: {pitch.contactEmail}</p>
                    <div className="flex gap-4 mt-3 text-sm text-slate-500">
                      <span>
                        Status:{' '}
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[pitch.status]}`}>
                          {pitch.status.replace('_', ' ')}
                        </span>
                      </span>
                      {pitch.responses && pitch.responses.length > 0 && (
                        <span>Responses: {pitch.responses.length}</span>
                      )}
                      <span>Follow-ups: {pitch.followUpCount}</span>
                    </div>
                  </div>
                  <Link
                    href={`/pitches/${pitch.id}`}
                    className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                  >
                    View
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
