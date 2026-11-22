
import React from 'react';
import {
  Truck,
  AlertTriangle,
  Activity,
  TrendingUp,
  Zap,
  MapPin,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/Card';

import { StatCard } from '@/components/StatCard';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Hardcoded zone data
const zones = [
  { id: 'Z01', name: 'Connaught Place', risk: 'HIGH', calls: 14, aqi: 312, temp: 38, elderly: 18, humidity: 72 },
  { id: 'Z02', name: 'Karol Bagh', risk: 'MODERATE', calls: 8, aqi: 198, temp: 36, elderly: 22, humidity: 65 },
  { id: 'Z03', name: 'Chandni Chowk', risk: 'CRITICAL', calls: 22, aqi: 420, temp: 41, elderly: 28, humidity: 80 },
  { id: 'Z04', name: 'Dwarka', risk: 'LOW', calls: 3, aqi: 120, temp: 34, elderly: 12, humidity: 55 },
  { id: 'Z05', name: 'Saket', risk: 'LOW', calls: 5, aqi: 145, temp: 35, elderly: 15, humidity: 58 },
  { id: 'Z06', name: 'Rohini', risk: 'MODERATE', calls: 10, aqi: 230, temp: 37, elderly: 20, humidity: 68 },
  { id: 'Z07', name: 'Lajpat Nagar', risk: 'HIGH', calls: 16, aqi: 340, temp: 39, elderly: 25, humidity: 75 },
  { id: 'Z08', name: 'Janakpuri', risk: 'LOW', calls: 4, aqi: 110, temp: 33, elderly: 10, humidity: 52 },
  { id: 'Z09', name: 'Pitampura', risk: 'MODERATE', calls: 9, aqi: 210, temp: 36, elderly: 19, humidity: 63 },
  { id: 'Z10', name: 'Nehru Place', risk: 'HIGH', calls: 13, aqi: 290, temp: 38, elderly: 21, humidity: 70 },
  { id: 'Z11', name: 'Mayur Vihar', risk: 'CRITICAL', calls: 19, aqi: 380, temp: 40, elderly: 26, humidity: 78 },
  { id: 'Z12', name: 'Vasant Kunj', risk: 'LOW', calls: 2, aqi: 95, temp: 32, elderly: 8, humidity: 50 },
] as const;

// Hardcoded ambulance data
const ambulances = [
  { id: 'A-01', zone: 'Z01', status: 'Busy' },
  { id: 'A-02', zone: 'Z03', status: 'Busy' },
  { id: 'A-03', zone: 'Z04', status: 'Idle' },
  { id: 'A-04', zone: 'Z05', status: 'Moving' },
  { id: 'A-05', zone: 'Z07', status: 'Busy' },
  { id: 'A-06', zone: 'Z08', status: 'Idle' },
  { id: 'A-07', zone: 'Z02', status: 'Idle' },
  { id: 'A-08', zone: 'Z06', status: 'Moving' },
  { id: 'A-09', zone: 'Z10', status: 'Busy' },
  { id: 'A-10', zone: 'Z12', status: 'Idle' },
] as const;

const riskColors: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MODERATE: '#eab308',
  LOW: '#22c55e',
};

const getRiskClass = (risk: string) => {
  switch (risk) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
    case 'HIGH':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
    case 'MODERATE':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
    default:
      return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
  }
};

export const Dashboard: React.FC = () => {
  // Dashboard statistics
  const stats = {
    totalAmbulances: ambulances.length,
    available: ambulances.filter((a) => a.status === 'Idle').length,
    moving: ambulances.filter((a) => a.status === 'Moving').length,
    occupied: ambulances.filter((a) => a.status === 'Busy').length,
    criticalZones: zones.filter((z) => z.risk === 'CRITICAL').length,
    activeIncidents: zones.reduce((total, z) => total + z.calls, 0),
  };

  // Risk distribution
  const riskDistribution = [
    { risk: 'Critical', count: zones.filter((z) => z.risk === 'CRITICAL').length, fill: riskColors.CRITICAL },
    { risk: 'High', count: zones.filter((z) => z.risk === 'HIGH').length, fill: riskColors.HIGH },
    { risk: 'Moderate', count: zones.filter((z) => z.risk === 'MODERATE').length, fill: riskColors.MODERATE },
    { risk: 'Low', count: zones.filter((z) => z.risk === 'LOW').length, fill: riskColors.LOW },
  ];

  // Fleet status
  const statusBreakdown = [
    { status: 'Available', count: stats.available, fill: '#22c55e' },
    { status: 'Moving', count: stats.moving, fill: '#3b82f6' },
    { status: 'Busy', count: stats.occupied, fill: '#ef4444' },
  ];

  // Highest demand zones
  const topHotspots = [...zones]
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 5)
    .map((z) => ({
      zone: z.name,
      calls: z.calls,
      risk: z.risk === 'CRITICAL' ? 90 : z.risk === 'HIGH' ? 75 : z.risk === 'MODERATE' ? 50 : 25,
    }));

  // Zones displayed in recent predictions
  const recentZones = [...zones]
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 6);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="text-blue-600" />
            Emergency Response Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Ambulance optimization and emergency demand overview
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">

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
          trend="up"
        />

        <StatCard
          title="En Route"
          value={stats.moving}
          icon={Zap}
          color="blue"
          trend="up"
        />

        <StatCard
          title="Critical Zones"
          value={stats.criticalZones}
          icon={AlertTriangle}
          color="red"
          trend="up"
        />

        <StatCard
          title="Active Incidents"
          value={stats.activeIncidents}
          icon={TrendingUp}
          color="orange"
          trend="neutral"
        />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Risk levels across 12 Delhi zones</CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="risk" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Zones" radius={[5, 5, 0, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>{stats.totalAmbulances} ambulances in the fleet</CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="count"
                  nameKey="status"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Demand Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Top Predicted Demand Zones</CardTitle>
          <CardDescription>Zones ranked by emergency call volume</CardDescription>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={topHotspots} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="calls"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Emergency Calls"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="risk"
                stroke="#ef4444"
                strokeWidth={2}
                name="Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Zone Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold">Zone Overview</h2>
            <p className="text-sm text-slate-500">
              Emergency demand and environmental conditions
            </p>
          </div>
          <span className="text-sm text-slate-500">12 Zones</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {recentZones.map((zone) => (
            <Card key={zone.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold">{zone.name}</h3>
                    <p className="text-xs text-slate-500">{zone.id}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRiskClass(zone.risk)}`}>
                    {zone.risk}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <p className="text-xs text-slate-500">Predicted Calls</p>
                    <p className="text-xl font-bold">{zone.calls}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">AQI</p>
                    <p className="text-xl font-bold">{zone.aqi}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Temperature</p>
                    <p className="font-semibold">{zone.temp}°C</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Humidity</p>
                    <p className="font-semibold">{zone.humidity}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ambulance Fleet */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Ambulance Fleet</CardTitle>
          <CardDescription>Current ambulance assignments and availability</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ambulances.map((ambulance) => (
              <div
                key={ambulance.id}
                className="border rounded-lg p-3 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-sm">{ambulance.id}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    {ambulance.zone}
                  </p>
                </div>

                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  ambulance.status === 'Idle'
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : ambulance.status === 'Moving'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                }`}>
                  {ambulance.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;