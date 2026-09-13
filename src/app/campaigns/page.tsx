'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Campaign } from '@/lib/campaign-schemas';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
      setLoading(false);
    };
    fetchCampaigns();
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
            Campaigns
          </motion.h1>
          <Link
            href="/campaigns/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Campaign
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-12 text-center"
          >
            <p className="text-slate-600 text-lg mb-4">No campaigns yet</p>
            <Link href="/campaigns/new" className="text-blue-600 hover:text-blue-700 font-medium">
              Create your first campaign →
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {campaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{campaign.name}</h3>
                    <p className="text-slate-600 mt-1">{campaign.subject}</p>
                    <div className="flex gap-4 mt-3 text-sm text-slate-500">
                      <span>Recipients: {campaign.recipientList.recipients.length}</span>
                      {campaign.sentAt && (
                        <span>Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>
                      )}
                      {!campaign.sentAt && <span className="text-amber-600">Draft</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                    >
                      Edit
                    </Link>
                    {!campaign.sentAt && (
                      <Link
                        href={`/campaigns/${campaign.id}/send`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Send
                      </Link>
                    )}
                    {campaign.sentAt && (
                      <Link
                        href={`/campaigns/${campaign.id}/stats`}
                        className="px-4 py-2 bg-blue-100 text-blue-900 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        Stats
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
