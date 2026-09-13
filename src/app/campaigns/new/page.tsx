'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { CreateCampaign } from '@/lib/campaign-schemas';

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recipientText, setRecipientText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    template: 'newsletter' as const,
    subject: '',
    htmlBody: '',
    textBody: '',
    fromEmail: '',
    fromName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const recipients = recipientText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const [email, name] = line.split(',').map((s) => s.trim());
        return { email, name: name || email };
      });

    const payload: CreateCampaign = {
      ...formData,
      recipientList: {
        type: 'inline' as const,
        recipients,
      },
      stats: {
        totalSent: 0,
        opens: 0,
        clicks: 0,
        bounces: 0,
        unsubscribes: 0,
      },
      tracking: {
        pixelId: `pixel_${Math.random().toString(36).substr(2, 9)}`,
        linkTracking: true,
      },
    };

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { campaign } = await res.json();
        router.push(`/campaigns/${campaign.id}`);
      } else {
        alert('Failed to create campaign');
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
          Create Campaign
        </motion.h1>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-8 shadow-lg space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Q4 Newsletter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Template Type</label>
            <select
              value={formData.template}
              onChange={(e) =>
                setFormData({ ...formData, template: e.target.value as 'newsletter' | 'announcement' | 'custom' })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newsletter">Newsletter</option>
              <option value="announcement">Announcement</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From Email</label>
              <input
                type="email"
                required
                value={formData.fromEmail}
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From Name</label>
              <input
                type="text"
                required
                value={formData.fromName}
                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject Line</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">HTML Body</label>
            <textarea
              required
              value={formData.htmlBody}
              onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Plain Text Body</label>
            <textarea
              required
              value={formData.textBody}
              onChange={(e) => setFormData({ ...formData, textBody: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Recipients (email or email,name per line)
            </label>
            <textarea
              required
              value={recipientText}
              onChange={(e) => setRecipientText(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="user@example.com,John Doe&#10;another@example.com,Jane Smith"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
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
