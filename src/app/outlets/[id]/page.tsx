'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Outlet, OutletContact } from '@/lib/pitch-schemas';

export default function EditOutletPage() {
  const params = useParams();
  const router = useRouter();
  const outletId = params.id as string;
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    categories: [] as string[],
  });

  const categoryOptions = ['Tech', 'Business', 'Science', 'Politics', 'General'];

  useEffect(() => {
    const fetchOutlet = async () => {
      const res = await fetch(`/api/outlets/${outletId}`);
      if (res.ok) {
        const data = await res.json();
        setOutlet(data.outlet);
        setFormData({
          name: data.outlet.name,
          website: data.outlet.website,
          categories: data.outlet.categories || [],
        });
      }
      setLoading(false);
    };
    fetchOutlet();
  }, [outletId]);

  const addContact = () => {
    if (contactEmail.trim() && outlet) {
      const newContacts = [
        ...(outlet.contacts || []),
        { email: contactEmail, name: contactName || contactEmail },
      ];
      setOutlet({ ...outlet, contacts: newContacts });
      setContactEmail('');
      setContactName('');
    }
  };

  const removeContact = (index: number) => {
    if (!outlet) return;
    const newContacts = outlet.contacts?.filter((_, i) => i !== index) || [];
    setOutlet({ ...outlet, contacts: newContacts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outlet) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/outlets/${outletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contacts: outlet.contacts,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOutlet(data.outlet);
        alert('Outlet updated');
      } else {
        alert('Failed to update outlet');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="animate-pulse max-w-2xl mx-auto space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-xl mb-4">Outlet not found</p>
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
      <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-slate-900 mb-8"
        >
          Edit Outlet
        </motion.h1>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-8 shadow-lg space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Outlet Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <label key={cat} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, categories: [...formData.categories, cat] });
                      } else {
                        setFormData({
                          ...formData,
                          categories: formData.categories.filter((c) => c !== cat),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contacts</label>
            <div className="space-y-2 mb-4">
              {outlet.contacts?.map((contact, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">{contact.name}</div>
                    <div className="text-sm text-slate-600">{contact.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@outlet.com"
              />
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contact Name"
              />
              <button
                type="button"
                onClick={addContact}
                className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
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
