'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Outlet } from '@/lib/pitch-schemas';
import type { CreatePitch } from '@/lib/pitch-schemas';

export default function NewPitchPage() {
  const router = useRouter();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    outletId: '',
    contactEmail: '',
    contactName: '',
    subject: '',
    body: '',
  });

  useEffect(() => {
    const fetchOutlets = async () => {
      const res = await fetch('/api/outlets');
      if (res.ok) {
        const data = await res.json();
        setOutlets(data.outlets || []);
      }
    };
    fetchOutlets();
  }, []);

  const handleOutletChange = (outletId: string) => {
    const outlet = outlets.find((o) => o.id === outletId);
    setFormData({
      ...formData,
      outletId,
      contactEmail: outlet?.contacts?.[0]?.email || '',
      contactName: outlet?.contacts?.[0]?.name || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: CreatePitch = {
      outletId: formData.outletId,
      contactEmail: formData.contactEmail,
      contactName: formData.contactName,
      subject: formData.subject,
      body: formData.body,
      attachments: [],
      status: 'draft',
      responses: [],
      followUpCount: 0,
      nextFollowUpAt: undefined,
    };

    try {
      const res = await fetch('/api/pitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { pitch } = await res.json();
        router.push(`/pitches/${pitch.id}`);
      } else {
        alert('Failed to create pitch');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-slate-900 mb-8"
        >
          New Pitch
        </motion.h1>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-8 shadow-lg space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Outlet</label>
            <select
              required
              value={formData.outletId}
              onChange={(e) => handleOutletChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an outlet...</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Name</label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Pitch Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Story idea: AI safety in 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Pitch Body</label>
            <textarea
              required
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={10}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Pitch'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
