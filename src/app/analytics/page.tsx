"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface AnalyticsData {
  totalPitches: number;
  pitchesSent: number;
  pitchesResponded: number;
  pitchesBounced: number;
  pitchesNoResponse: number;
  responsRate: number;
  autoRepliesCount: number;
  manualRepliesCount: number;
  avgResponseTimeMs: number;
  responsesByOutlet: Record<string, {
    name: string;
    totalPitches: number;
    responsesCount: number;
    responseRate: number;
  }>;
  responseDistribution: {
    byDay: Record<string, number>;
    byHour: Record<number, number>;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedOutlet]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedOutlet) {
        params.append("outletId", selectedOutlet);
      }
      const res = await fetch(`/api/responses/analytics?${params}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const analytics = await res.json();
      setData(analytics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-slate-300 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="text-center">
          <p className="text-red-400">{error || "No data available"}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const dayData = Object.entries(data.responseDistribution.byDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const hourData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    responses: data.responseDistribution.byHour[i] || 0,
  }));

  const outletData = Object.entries(data.responsesByOutlet)
    .map(([id, outlet]) => ({
      name: outlet.name,
      id,
      totalPitches: outlet.totalPitches,
      responses: outlet.responsesCount,
      rate: outlet.responseRate,
    }))
    .sort((a, b) => b.rate - a.rate);

  const responseTypeData = [
    { name: "Auto-Replies", value: data.autoRepliesCount, color: "#3b82f6" },
    { name: "Manual Replies", value: data.manualRepliesCount, color: "#10b981" },
  ];

  const statusData = [
    { name: "Responded", value: data.pitchesResponded, color: "#10b981" },
    { name: "No Response", value: data.pitchesNoResponse, color: "#f59e0b" },
    { name: "Bounced", value: data.pitchesBounced, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Navigation */}
      <div className="mb-8 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-8 max-w-7xl mx-auto">
          <Link href="/campaigns" className="text-slate-300 hover:text-white transition">
            Campaigns
          </Link>
          <Link href="/pitches" className="text-slate-300 hover:text-white transition">
            Pitches
          </Link>
          <Link href="/outlets" className="text-slate-300 hover:text-white transition">
            Outlets
          </Link>
          <Link href="/analytics" className="text-blue-400 font-medium">
            Analytics
          </Link>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <div className="mb-12">
          <motion.h1 variants={itemVariants} className="text-4xl font-bold text-white mb-2">
            Response Analytics
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-300">
            Track pitch responses, engagement rates, and reply patterns
          </motion.p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-300 text-sm font-medium">Total Pitches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{data.totalPitches}</div>
                <p className="text-xs text-slate-400 mt-1">{data.pitchesSent} sent</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-300 text-sm font-medium">Response Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{data.responsRate.toFixed(1)}%</div>
                <p className="text-xs text-slate-400 mt-1">{data.pitchesResponded} responses</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-300 text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {(data.avgResponseTimeMs / (1000 * 60 * 60)).toFixed(1)}h
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {Math.round(data.avgResponseTimeMs / 1000)} seconds
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-300 text-sm font-medium">Auto-Replies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-400">{data.autoRepliesCount}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {data.manualRepliesCount > 0
                    ? ((data.autoRepliesCount / (data.autoRepliesCount + data.manualRepliesCount)) * 100).toFixed(0)
                    : 0}
                  % of responses
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response Type Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Response Types</CardTitle>
                <CardDescription>Auto-replies vs manual responses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={responseTypeData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {responseTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pitch Status</CardTitle>
                <CardDescription>Distribution of pitch outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Responses by Hour */}
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Responses by Hour of Day</CardTitle>
                <CardDescription>Response volume by hour (24-hour format)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="hour" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                    <Bar dataKey="responses" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Responses by Day */}
          {dayData.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Responses Over Time</CardTitle>
                  <CardDescription>Response volume by day (last 30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#10b981" name="Responses" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Outlet Performance */}
        {outletData.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Outlet Performance</CardTitle>
                <CardDescription>Response rates by media outlet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {outletData.map((outlet) => (
                    <div
                      key={outlet.id}
                      onClick={() => setSelectedOutlet(selectedOutlet === outlet.id ? null : outlet.id)}
                      className="p-4 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-white font-medium">{outlet.name}</h3>
                          <p className="text-sm text-slate-400">
                            {outlet.responses} of {outlet.totalPitches} responded
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-400">{outlet.rate.toFixed(1)}%</div>
                          <p className="text-xs text-slate-400">Response Rate</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                          style={{ width: `${Math.min(outlet.rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
