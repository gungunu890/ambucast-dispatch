import React from 'react';
import { Truck, AlertTriangle, Activity, TrendingUp, Zap, CheckCircle, AlertCircle, RefreshCw, Power } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { HotspotCard } from '@/components/HotspotCard';
import { useAmbulances, useHotspots, useAutoAllocation } from '@/hooks/useData';
import { useAppStore } from '@/lib/store';
import { Ambulance, Hotspot } from '@/lib/types';
import { getZoneDisplayName } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useQueryClient } from '@tanstack/react-query';

// ─── Sample data: always used for zone predictions ───
// Edit the numbers freely. risk_class must be: critical, high, medium or low.
// risk_score is on a 0-1 scale here; change it if your model uses 0-100.
const minsAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

const DEMO_HOTSPOTS = [
  { id: 'demo-1',  zone_id: 'demo_connaught_place', area: 'Connaught Place', zone_name: 'Connaught Place', risk_class: 'critical', risk_score: 0.91, predicted_calls: 9, timestamp: minsAgo(2) },
  { id: 'demo-2',  zone_id: 'demo_chandni_chowk',   area: 'Chandni Chowk',   zone_name: 'Chandni Chowk',   risk_class: 'critical', risk_score: 0.88, predicted_calls: 8, timestamp: minsAgo(3) },
  { id: 'demo-3',  zone_id: 'demo_karol_bagh',      area: 'Karol Bagh',      zone_name: 'Karol Bagh',      risk_class: 'high',     risk_score: 0.79, predicted_calls: 7, timestamp: minsAgo(4) },
  { id: 'demo-4',  zone_id: 'demo_lajpat_nagar',    area: 'Lajpat Nagar',    zone_name: 'Lajpat Nagar',    risk_class: 'high',     risk_score: 0.74, predicted_calls: 6, timestamp: minsAgo(5) },
  { id: 'demo-5',  zone_id: 'demo_nehru_place',     area: 'Nehru Place',     zone_name: 'Nehru Place',     risk_class: 'high',     risk_score: 0.70, predicted_calls: 6, timestamp: minsAgo(6) },
  { id: 'demo-6',  zone_id: 'demo_saket',           area: 'Saket',           zone_name: 'Saket',           risk_class: 'medium',   risk_score: 0.55, predicted_calls: 4, timestamp: minsAgo(7) },
  { id: 'demo-7',  zone_id: 'demo_mayur_vihar',     area: 'Mayur Vihar',     zone_name: 'Mayur Vihar',     risk_class: 'medium',   risk_score: 0.52, predicted_calls: 4, timestamp: minsAgo(8) },
  { id: 'demo-8',  zone_id: 'demo_rohini',          area: 'Rohini',          zone_name: 'Rohini',          risk_class: 'medium',   risk_score: 0.47, predicted_calls: 3, timestamp: minsAgo(9) },
  { id: 'demo-9',  zone_id: 'demo_pitampura',       area: 'Pitampura',       zone_name: 'Pitampura',       risk_class: 'medium',   risk_score: 0.44, predicted_calls: 3, timestamp: minsAgo(10) },
  { id: 'demo-10', zone_id: 'demo_janakpuri',       area: 'Janakpuri',       zone_name: 'Janakpuri',       risk_class: 'low',      risk_score: 0.28, predicted_calls: 2, timestamp: minsAgo(11) },
  { id: 'demo-11', zone_id: 'demo_dwarka',          area: 'Dwarka',          zone_name: 'Dwarka',          risk_class: 'low',      risk_score: 0.22, predicted_calls: 1, timestamp: minsAgo(12) },
  { id: 'demo-12', zone_id: 'demo_vasant_kunj',     area: 'Vasant Kunj',     zone_name: 'Vasant Kunj',     risk_class: 'low',      risk_score: 0.18, predicted_calls: 1, timestamp: minsAgo(13) }
] as unknown as Hotspot[];

// Used only when the real ambulance list is empty (e.g. backend still waking up)
const DEMO_FLEET = { totalAmbulances: 27, available: 9, moving: 18, occupied: 0, maintenance: 0 };

export const Dashboard: React.FC = () => {
  const { data: ambulances = [], isLoading: loadingAmbulances, refetch: refetchAmbulances } = useAmbulances();
  const { isLoading: loadingHotspots, refetch: refetchHotspots } = useHotspots();
  const { status: allocationStatus } = useAutoAllocation(); // Automatic allocation runs every 30 mins

  // Zone predictions always come from the sample data above.
  // To use real predictions again, replace DEMO_HOTSPOTS below with the live hotspots.
  const usingDemoFleet = ambulances.length === 0;
  const hotspots = DEMO_HOTSPOTS;

  const autoFetchEnabled = useAppStore((state) => state.autoFetchEnabled);
  const setAutoFetchEnabled = useAppStore((state) => state.setAutoFetchEnabled);
  const queryClient = useQueryClient();

  const liveFleet = {
    totalAmbulances: ambulances?.length || 0,
    available: ambulances?.filter((a: Ambulance) => a.status?.toUpperCase() === 'AVAILABLE').length || 0,
    moving: ambulances?.filter((a: Ambulance) => a.status?.toUpperCase() === 'MOVING').length || 0,
    occupied: ambulances?.filter((a: Ambulance) => a.status?.toUpperCase() === 'OCCUPIED').length || 0,
    maintenance: ambulances?.filter((a: Ambulance) => a.status?.toUpperCase() === 'MAINTENANCE').length || 0,
  };

  const stats = {
    ...(usingDemoFleet ? DEMO_FLEET : liveFleet),
    criticalZones: hotspots.filter((h: Hotspot) => h.risk_class === 'critical').length,
    activeIncidents: hotspots.filter((h: Hotspot) => h.predicted_calls > 5).length,
  };

  // Prepare chart data
  const riskDistribution = [
    { risk: 'Critical', count: hotspots.filter((h: Hotspot) => h.risk_class === 'critical').length, fill: '#dc2626' },
    { risk: 'High', count: hotspots.filter((h: Hotspot) => h.risk_class === 'high').length, fill: '#f97316' },
    { risk: 'Medium', count: hotspots.filter((h: Hotspot) => h.risk_class === 'medium').length, fill: '#eab308' },
    { risk: 'Low', count: hotspots.filter((h: Hotspot) => h.risk_class === 'low').length, fill: '#22c55e' },
  ];

  // [...hotspots] makes a copy so sorting doesn't change the original data
  const topHotspots = [...hotspots]
    .sort((a: Hotspot, b: Hotspot) => b.predicted_calls - a.predicted_calls)
    .slice(0, 5)
    .map((h: Hotspot) => ({
      zone: h.area || h.zone_name || getZoneDisplayName(h.zone_id),
      calls: h.predicted_calls,
      risk: h.risk_score,
    }));

  const statusBreakdown = [
    { status: 'Available', count: stats.available, fill: '#22c55e' },
    { status: 'Moving', count: stats.moving, fill: '#3b82f6' },
    { status: 'Occupied', count: stats.occupied, fill: '#ef4444' },
    { status: 'Maintenance', count: stats.maintenance, fill: '#64748b' },
  ];

  const recentHotspots = [...hotspots]
    .sort((a: Hotspot, b: Hotspot) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Activity className="text-blue-600" />
            Emergency Response Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Real-time ambulance optimization & demand prediction • {autoFetchEnabled ? 'Auto-updating every 12-15 minutes' : 'Manual mode - use refresh button below'}
          </p>
          <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
            Zone predictions shown are sample data
          </span>
        </div>

        {/* Controls: Auto-Fetch Toggle & Manual Refresh */}
        <div className="flex gap-2">
          <button
            onClick={() => setAutoFetchEnabled(!autoFetchEnabled)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              autoFetchEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            <Power className="h-4 w-4" />
            {autoFetchEnabled ? 'Auto-Fetch ON' : 'Auto-Fetch OFF'}
          </button>

          <button
            onClick={() => {
              refetchAmbulances();
              refetchHotspots();
              queryClient.invalidateQueries({ queryKey: ['ambulances'] });
              queryClient.invalidateQueries({ queryKey: ['hotspots'] });
            }}
            disabled={loadingAmbulances || loadingHotspots}
            className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900 dark:text-blue-200"
          >
            <RefreshCw className={`h-4 w-4 ${loadingAmbulances || loadingHotspots ? 'animate-spin' : ''}`} />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Auto-Allocation Status Indicator */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6 flex items-center gap-4">
          {allocationStatus === 'running' && (
            <>
              <div className="animate-spin"><Zap className="text-blue-600 h-5 w-5" /></div>
              <div>
                <p className="font-medium">Running Allocation Algorithm...</p>
                <p className="text-sm text-slate-600">Optimizing ambulance dispatch (runs every 30 minutes automatically)</p>
              </div>
            </>
          )}
          {allocationStatus === 'success' && (
            <>
              <CheckCircle className="text-green-600 h-5 w-5" />
              <div>
                <p className="font-medium">Allocation Optimized ✓</p>
                <p className="text-sm text-slate-600">Last run: Just now (automatic) • Next: in 30 minutes</p>
              </div>
            </>
          )}
          {allocationStatus === 'error' && (
            <>
              <AlertCircle className="text-red-600 h-5 w-5" />
              <div>
                <p className="font-medium">Allocation Error</p>
                <p className="text-sm text-slate-600">Will retry automatically in 30 minutes</p>
              </div>
            </>
          )}
          {allocationStatus === 'idle' && (
            <>
              <CheckCircle className="text-slate-400 h-5 w-5" />
              <div>
                <p className="font-medium">System Idle</p>
                <p className="text-sm text-slate-600">Next allocation run in progress...</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Ambulances"
          value={stats.totalAmbulances}
          icon={Truck}
          color="blue"
          trend="stable"
        />
        <StatCard
          title="Available Now"
          value={stats.available}
          icon={Activity}
          color="green"
          trend={stats.available > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="En Route"
          value={stats.moving}
          icon={Zap}
          color="blue"
          trend={stats.moving > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Critical Zones"
          value={stats.criticalZones}
          icon={AlertTriangle}
          color="red"
          trend={stats.criticalZones > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Active Incidents"
          value={stats.activeIncidents}
          icon={TrendingUp}
          color="orange"
          trend="neutral"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Current zones by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="risk" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6">
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>{stats.totalAmbulances} ambulances total</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Hotspots Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Predicted Demand Zones</CardTitle>
          <CardDescription>Top 5 zones with highest predicted emergency calls</CardDescription>
        </CardHeader>
        <CardContent>
          {topHotspots.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={topHotspots}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis yAxisId="left" label={{ value: 'Calls', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Risk Score', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="calls" stroke="#3b82f6" name="Predicted Calls" />
                <Line yAxisId="right" type="monotone" dataKey="risk" stroke="#ef4444" name="Risk Score" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              Loading hotspot data...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Hotspots Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Predictions (Auto-Updated)</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">Batch ML predictions run automatically every 12 minutes</p>
        {recentHotspots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentHotspots.map((hotspot: Hotspot) => (
              <HotspotCard key={hotspot.id} hotspot={hotspot} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-600">No hotspots yet. Automatic ML predictions will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;