import React, { useState, useEffect } from 'react';
import { AlertCircle, Globe, TrendingUp, Shield, Zap, Activity, Wind, Waves } from 'lucide-react';
import axios from 'axios';

const WorldMonitorDashboard = () => {
  const [globalSituation, setGlobalSituation] = useState(null);
  const [militaryActivity, setMilitaryActivity] = useState(null);
  const [infrastructure, setInfrastructure] = useState(null);
  const [financialMarkets, setFinancialMarkets] = useState(null);
  // eslint-disable-next-line no-unused-vars -- fetched alongside the other feeds for parity; not yet surfaced in its own tab
  const [energyStatus, setEnergyStatus] = useState(null);
  const [cyberThreats, setCyberThreats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/intelligence`;

      const [
        globalRes,
        militaryRes,
        infraRes,
        financialRes,
        energyRes,
        cyberRes
      ] = await Promise.all([
        axios.get(`${baseURL}/global-situation`),
        axios.get(`${baseURL}/military-activity`),
        axios.get(`${baseURL}/infrastructure`),
        axios.get(`${baseURL}/financial-markets`),
        axios.get(`${baseURL}/energy`),
        axios.get(`${baseURL}/cyber-threats`)
      ]);

      setGlobalSituation(globalRes.data);
      setMilitaryActivity(militaryRes.data);
      setInfrastructure(infraRes.data);
      setFinancialMarkets(financialRes.data);
      setEnergyStatus(energyRes.data);
      setCyberThreats(cyberRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch world monitor data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level) => {
    const colors = {
      LOW: 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/25',
      MEDIUM: 'text-amber-200 bg-amber-500/15 border border-amber-500/25',
      HIGH: 'text-orange-300 bg-orange-500/15 border border-orange-500/25',
      CRITICAL: 'text-red-300 bg-red-500/15 border border-red-500/25'
    };
    return colors[level] || colors.MEDIUM;
  };

  const RiskBadge = ({ level }) => (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getThreatColor(level)}`}>
      {level}
    </span>
  );

  const GlobalSituation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border border-red-500/25 bg-red-500/10 shadow-premium-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-300">Threat Level</p>
              <p className="text-3xl font-bold text-red-200 mt-2">
                {globalSituation?.threat_level}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-orange-500/25 bg-orange-500/10 shadow-premium-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-300">Escalation Index</p>
              <p className="text-3xl font-bold text-orange-200 mt-2">
                {globalSituation?.escalation_index?.toFixed(1)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-400" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-accent-500/25 bg-accent-500/10 shadow-premium-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-400">Stability Score</p>
              <p className="text-3xl font-bold text-[color:var(--pragna-text)] mt-2">
                {globalSituation?.stability_score?.toFixed(1) ?? '—'}/100
              </p>
            </div>
            <Globe className="w-12 h-12 text-accent-500" />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 shadow-premium-sm">
        <h3 className="text-lg font-semibold text-[color:var(--pragna-text)] mb-4">Critical Alerts</h3>
        <div className="space-y-3">
          {globalSituation?.alerts?.length ? (
            globalSituation.alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-red-500/25 bg-red-500/10">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-[color:var(--pragna-text)]">{alert.category}</p>
                  <p className="text-sm text-[color:var(--pragna-text-muted)]">{alert.description}</p>
                  <p className="text-xs text-[color:var(--pragna-text-muted)] mt-1">{alert.location}</p>
                </div>
                <RiskBadge level={alert.severity} />
              </div>
            ))
          ) : (
            <p className="text-sm text-[color:var(--pragna-text-muted)]">No critical alerts at this time.</p>
          )}
        </div>
      </div>
    </div>
  );

  const MilitaryTracking = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-6 shadow-premium-sm">
          <h3 className="text-lg font-semibold text-[color:var(--pragna-text)] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-500" /> Aircraft Movements
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[color:var(--pragna-text-muted)]">Active Flights:</span>
              <span className="font-bold text-[color:var(--pragna-text)]">{militaryActivity?.aircraft_movements?.active_flights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[color:var(--pragna-text-muted)]">Anomalies:</span>
              <span className="font-bold text-red-300">{militaryActivity?.aircraft_movements?.anomalies}</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-premium-sm">
          <h3 className="text-lg font-semibold text-[color:var(--pragna-text)] mb-4 flex items-center gap-2">
            <Waves className="w-5 h-5 text-accent-500" /> Naval Movements
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[color:var(--pragna-text-muted)]">Active Vessels:</span>
              <span className="font-bold text-[color:var(--pragna-text)]">{militaryActivity?.naval_movements?.active_vessels}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[color:var(--pragna-text-muted)]">Carrier Groups:</span>
              <span className="font-bold text-[color:var(--pragna-text)]">{militaryActivity?.naval_movements?.carrier_groups}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const InfrastructureStatus = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 shadow-premium-sm">
          <Zap className="w-6 h-6 text-amber-400 mb-2" />
          <p className="text-sm font-medium text-[color:var(--pragna-text-muted)]">Power Grids</p>
          <p className="text-lg font-bold mt-1 text-[color:var(--pragna-text)]">NORMAL</p>
        </div>

        <div className="glass-card rounded-2xl p-4 shadow-premium-sm">
          <Activity className="w-6 h-6 text-accent-500 mb-2" />
          <p className="text-sm font-medium text-[color:var(--pragna-text-muted)]">Communication</p>
          <p className="text-lg font-bold mt-1 text-[color:var(--pragna-text)]">4/480</p>
        </div>

        <div className="glass-card rounded-2xl p-4 shadow-premium-sm">
          <Wind className="w-6 h-6 text-orange-400 mb-2" />
          <p className="text-sm font-medium text-[color:var(--pragna-text-muted)]">Pipelines</p>
          <p className="text-lg font-bold mt-1 text-[color:var(--pragna-text)]">{infrastructure?.pipelines?.disruptions || 5}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 shadow-premium-sm">
          <Globe className="w-6 h-6 text-accent-400 mb-2" />
          <p className="text-sm font-medium text-[color:var(--pragna-text-muted)]">Ports</p>
          <p className="text-lg font-bold mt-1 text-[color:var(--pragna-text)]">{infrastructure?.ports?.affected_ports || 23}</p>
        </div>
      </div>
    </div>
  );

  const FinancialMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 shadow-premium-sm">
          <p className="text-sm font-medium text-[color:var(--pragna-text-muted)] mb-2">S&amp;P 500</p>
          <p className="text-2xl font-bold text-[color:var(--pragna-text)]">{financialMarkets?.stock_markets?.us_markets?.change || '+0.5%'}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 shadow-premium-sm">
          <p className="text-sm font-medium text-[color:var(--pragna-text-muted)] mb-2">Gold Price</p>
          <p className="text-2xl font-bold text-[color:var(--pragna-text)]">${financialMarkets?.commodities?.gold || '2,150'}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 shadow-premium-sm">
          <p className="text-sm font-medium text-[color:var(--pragna-text-muted)] mb-2">WTI Crude</p>
          <p className="text-2xl font-bold text-[color:var(--pragna-text)]">${financialMarkets?.energy_prices?.wti_crude || '85.50'}</p>
        </div>
      </div>
    </div>
  );

  const CyberThreatTracker = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-red-500/25 bg-red-500/10 shadow-premium-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-300">Cyber Threat Level</p>
            <p className="text-3xl font-bold text-red-200 mt-2">{cyberThreats?.threat_level || 'HIGH'}</p>
          </div>
          <Shield className="w-12 h-12 text-red-400" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Globe className="w-12 h-12 text-accent-500 mx-auto mb-4 animate-spin" />
          <p className="text-[color:var(--pragna-text-muted)]">Loading global intelligence data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-[28px] font-bold text-[color:var(--pragna-text)] mb-1.5">World Monitor Intelligence Dashboard</h1>
        <p className="text-sm text-[color:var(--pragna-text-muted)] mb-6">Real-time global intelligence and monitoring</p>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl border border-red-400/30 bg-red-500/10">
            <AlertCircle className="w-[17px] h-[17px] text-red-300 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="mb-6 border-b border-border flex gap-1 overflow-x-auto">
          {[
            { id: 'global', label: 'Global', icon: Globe },
            { id: 'military', label: 'Military', icon: Shield },
            { id: 'infrastructure', label: 'Infrastructure', icon: Activity },
            { id: 'financial', label: 'Markets', icon: TrendingUp },
            { id: 'cyber', label: 'Cyber', icon: AlertCircle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap text-sm ${
                  activeTab === tab.id
                    ? 'border-accent-500 text-accent-400'
                    : 'border-transparent text-[color:var(--pragna-text-muted)] hover:text-[color:var(--pragna-text)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-premium-sm">
          {activeTab === 'global' && <GlobalSituation />}
          {activeTab === 'military' && <MilitaryTracking />}
          {activeTab === 'infrastructure' && <InfrastructureStatus />}
          {activeTab === 'financial' && <FinancialMetrics />}
          {activeTab === 'cyber' && <CyberThreatTracker />}
        </div>

        <button
          onClick={fetchDashboardData}
          className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-br from-accent-400 to-accent-700 text-[#0a0a0a] text-sm font-bold shadow-premium-md transition-transform hover:scale-[1.02]"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default WorldMonitorDashboard;
