'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Pitch, PitchResponse } from '@/lib/pitch-schemas';

export default function PitchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pitchId = params.id as string;
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    const fetchPitch = async () => {
      const res = await fetch(`/api/pitches/${pitchId}`);
      if (res.ok) {
        const data = await res.json();
        setPitch(data.pitch);
      }
      setLoading(false);
    };
    fetchPitch();
  }, [pitchId]);

  const handleFollowUp = async () => {
    if (!pitch) return;
    const res = await fetch(`/api/pitches/${pitchId}/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledFor: followUpDate || new Date() }),
    });
    if (res.ok) {
      const data = await res.json();
      setPitch(data.pitch);
      setFollowUpDate('');
      alert('Follow-up scheduled');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="animate-pulse max-w-4xl mx-auto space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-xl mb-4">Pitch not found</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back →
          </button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-900',
    sent: 'bg-blue-100 text-blue-900',
    responded: 'bg-green-100 text-green-900',
    bounced: 'bg-red-100 text-red-900',
    no_response: 'bg-amber-100 text-amber-900',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-slate-900">{pitch.subject}</h1>
          <p className="text-slate-600 mt-2">To: {pitch.contactEmail}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-slate-600">Status</div>
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[pitch.status]}`}>
                {pitch.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-slate-600">Responses</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">
              {pitch.responses?.length || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-slate-600">Follow-ups</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">
              {pitch.followUpCount}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pitch Body</h2>
          <p className="text-slate-700 whitespace-pre-wrap">{pitch.body}</p>
        </motion.div>

        {pitch.responses && pitch.responses.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Responses</h2>
            <div className="space-y-4">
              {pitch.responses.map((resp: PitchResponse, i: number) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-900">{resp.type}</div>
                      <p className="text-slate-600 mt-1">{resp.content}</p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(resp.receivedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Schedule Follow-up</h2>
          <div className="flex gap-4">
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleFollowUp}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
