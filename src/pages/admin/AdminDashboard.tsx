import { useState, useEffect } from 'react';
import type { ElementType } from 'react';
import { FaUsers, FaBriefcase, FaUserTie, FaArrowDown, FaUserCheck } from 'react-icons/fa';
import StatCard from '../../components/molecules/StatCard';
import MonthlyTrendsChart from '../../components/charts/MonthlyTrendsChart';
import LeadsByStatusChart from '../../components/charts/LeadsByStatusChart';
import LeadsBySourceChart from '../../components/charts/LeadsBySourceChart';
import RecentLeadsTable from '../../components/tables/RecentLeadsTable';
import TopPerformersTable from '../../components/tables/TopPerformersTable';
import { getDashboardData } from '../../services/dashboardService';
import { getLeads } from '../../services/leadService';

const UsersIcon = FaUsers as ElementType;
const BriefcaseIcon = FaBriefcase as ElementType;
const UserTieIcon = FaUserTie as ElementType;
const ArrowDownIcon = FaArrowDown as ElementType;
const UserCheckIcon = FaUserCheck as ElementType;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [assignedLeadsCount, setAssignedLeadsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [response, leadsResponse] = await Promise.all([
          getDashboardData(),
          getLeads({ page: 1, limit: 10000 }),
        ]);
        setData(response.data);
        const leadsPayload: any = leadsResponse?.data;
        const leads = Array.isArray(leadsPayload)
          ? leadsPayload
          : Array.isArray(leadsPayload?.leads)
            ? leadsPayload.leads
            : [];
        setAssignedLeadsCount(
          leads.filter((lead: any) => {
            const assignedAgent = lead?.assignedAgent;
            const assignedManager = lead?.assignedManager;
            return Boolean(
              (assignedAgent && (typeof assignedAgent !== 'string' || assignedAgent.trim())) ||
              (assignedManager && (typeof assignedManager !== 'string' || assignedManager.trim()))
            );
          }).length
        );
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="error-state">Failed to load dashboard data</div>;
  }

  const { stats, charts, tables } = data;
  const getStatValue = (title: string, fallback = 0) =>
    stats?.find((stat: any) => stat.title === title)?.value ?? fallback;

  // KPI Stats - mapped from backend data
  const kpiStats = [
    {
      title: 'Total Leads',
      value: getStatValue('Total Leads'),
      change: '+0%',
      changeType: 'up' as const,
      sub: 'Total',
      icon: <BriefcaseIcon />,
      accentColor: 'violet' as const,
    },
    {
      title: 'Managers',
      value: getStatValue('Managers'),
      change: '+0%',
      changeType: 'up' as const,
      sub: 'Total',
      icon: <UserTieIcon />,
      accentColor: 'teal' as const,
    },
    {
      title: 'Active Agents',
      value: getStatValue('Active Agents'),
      change: '+0%',
      changeType: 'up' as const,
      sub: 'Total',
      icon: <UsersIcon />,
      accentColor: 'amber' as const,
    },
    {
      title: 'Total Assigned Leads',
      value: assignedLeadsCount ?? getStatValue('Total Assigned Leads'),
      change: '+0%',
      changeType: 'up' as const,
      sub: 'Assigned',
      icon: <UserCheckIcon />,
      accentColor: 'coral' as const,
    },
  ];

  // Lead Performance Metrics - calculated from charts data
  const leadsByStatusMap = (charts?.leadsByStatus || []).reduce((acc: any, item: any) => {
    acc[item.name] = item.value;
    return acc;
  }, {});

  const leadPerformanceMetrics = [
    {
      label: 'Lost Leads',
      value: leadsByStatusMap['lost'] || 0,
      icon: <ArrowDownIcon />,
      color: 'var(--accent3)',
      change: '+0%',
      changeType: 'up',
    },
  ];

  // Manager Performance Data - using top performers from backend
  const managerPerformanceData = (tables?.topPerformers || []).map((performer: any, index: number) => ({
    rank: index + 1,
    name: performer.name,
    role: 'Manager',
    initials: performer.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U',
    wins: performer.convertedLeads || 0,
    maxWins: performer.totalLeads || 50,
    color: ['#2196F3', '#00BCD4', '#9C27B0', '#FFC107'][index % 4],
  }));

  // Followup Leads
  const followupLeadsData = (tables?.followupLeads || []).map((lead: any) => {
    const pendingFollowups = (lead.followUps || []).filter((f: any) => f.status === 'pending');
    const nextFollowup = pendingFollowups.sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];

    return {
      _id: lead._id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      agent: lead.assignedAgent?.name || 'Unassigned',
      status: lead.status,
      createdAt: lead.createdAt,
      followupDate: nextFollowup?.date,
    };
  });

  // Recent Leads Data with Status
  const recentLeadsData = (tables?.recentLeads || []).map((lead: any) => ({
    _id: lead._id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    agent: lead.assignedAgent?.name || 'Unassigned',
    status: lead.status,
    createdAt: lead.createdAt,
  }));

  // Monthly Trends Data - from backend
  const monthlyTrendsData = (charts?.monthlyTrends || []).map((item: any) => ({
    month: item.month,
    newLeads: item.leads,
    won: 0,
  }));

  // Leads by Status Data - from backend
  const leadsByStatusData = charts?.leadsByStatus || [];

  // Lead Sources Data - from backend
  const leadSourcesData = (charts?.leadsBySource || []).map((item: any, index: number) => ({
    label: item.name,
    count: item.value,
    percent: 0,
    color: ['#2196F3', '#00BCD4', '#4CAF50', '#FFC107', '#FF5722'][index % 5],
  }));

  return (
    <div className="dashboard-content">
      {/* KPI Cards Row */}
      <div className="kpi-grid">
        {kpiStats.map((stat, index) => (
          <StatCard key={index} data={stat} />
        ))}
      </div>

      {/* Lead Performance Metrics Row */}
      <div className="quick-stats-grid">
        {leadPerformanceMetrics.map((metric: any, index: number) => (
          <div key={index} className="quick-stat-card">
            <div className="quick-stat-icon" style={{ backgroundColor: `${metric.color}15`, color: metric.color }}>
              {metric.icon}
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-label">{metric.label}</div>
              <div className="quick-stat-value">{metric.value}</div>
              <div className="quick-stat-change" style={{ color: metric.changeType === 'up' ? 'var(--green)' : 'var(--accent3)' }}>
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <MonthlyTrendsChart data={monthlyTrendsData} />
        <LeadsByStatusChart data={leadsByStatusData} />
      </div>

      {/* Manager Performance and Lead Sources Row */}
      <div className="bottom-grid">
        <div className="card">
          <h3 className="chart-title">Manager Performance</h3>
          <TopPerformersTable data={managerPerformanceData} />
        </div>
        <LeadsBySourceChart data={leadSourcesData} />
      </div>

      {/* Followup Leads Section */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="chart-title">Followup Leads</h3>
        <RecentLeadsTable data={followupLeadsData} dateColumnLabel="Follow-up Date" dateField="followupDate" />
      </div>

      {/* Recent Leads with Status Section */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="chart-title">Recent Leads</h3>
        <RecentLeadsTable data={recentLeadsData} />
      </div>
    </div>
  );
};

export default AdminDashboard;
