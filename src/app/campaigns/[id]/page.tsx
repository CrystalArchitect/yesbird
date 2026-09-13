'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Campaign } from '@/lib/campaign-schemas';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
      }
      setLoading(false);
    };
    fetchCampaign();
  }, [campaignId]);

  const handleSend = async () => {
    if (!confirm('Send this campaign to all recipients?')) return;
    setSending(true);

    const res = await fetch(`/api/campaigns/${campaignId}/send`, {
      method: 'POST',
    });

    if (res.ok) {
      const data = await res.json();
      setCampaign(data.campaign);
      alert(`Campaign sent to ${data.result.sent} recipients`);
    } else {
      alert('Failed to send campaign');
    }
    setSending(false);
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

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-xl mb-4">Campaign not found</p>
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
          <h1 className="text-4xl font-bold text-slate-900">{campaign.name}</h1>
          <p className="text-slate-600 mt-2">{campaign.subject}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-slate-600">Recipients</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">
              {campaign.recipientList.recipients.length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-slate-600">Status</div>
            <div className="text-lg font-bold text-slate-900 mt-2">
              {campaign.sentAt ? 'Sent' : 'Draft'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-slate-600">Created</div>
            <div className="text-lg font-bold text-slate-900 mt-2">
              {new Date(campaign.createdAt).toLocaleDateString()}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Message Preview</h2>
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">From</h3>
            <p className="text-slate-600">
              {campaign.fromName} &lt;{campaign.fromEmail}&gt;
            </p>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">Subject</h3>
            <p className="text-slate-600">{campaign.subject}</p>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">Plain Text</h3>
            <pre className="bg-slate-100 p-4 rounded text-xs text-slate-700 overflow-auto">
              {campaign.textBody}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">HTML Preview</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 overflow-auto">
              <iframe
                srcDoc={campaign.htmlBody}
                className="w-full h-96 border-none"
                title="HTML Preview"
              />
            </div>
          </div>
        </motion.div>

        {campaign.sentAt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-8 shadow-lg mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Engagement</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-slate-600">Opens</div>
                <div className="text-2xl font-bold text-slate-900">{campaign.stats.opens}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600">Clicks</div>
                <div className="text-2xl font-bold text-slate-900">{campaign.stats.clicks}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600">Bounces</div>
                <div className="text-2xl font-bold text-slate-900">{campaign.stats.bounces}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600">Unsubscribes</div>
                <div className="text-2xl font-bold text-slate-900">{campaign.stats.unsubscribes}</div>
              </div>
            </div>
          </motion.div>
        )}

        {!campaign.sentAt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Campaign'}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {campaign.sentAt && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => router.back()}
            className="w-full px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Back to Campaigns
          </motion.button>
        )}
      </div>
    </div>
  );
}
