import {
  Activity,
  AlertCircle,
  Archive,
  Building,
  CheckCircle,
  Clock,
  FileText,
  Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardStats {
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats[]>([
    { title: 'Total Warehouses', value: '12', change: '+2', icon: Building, color: 'text-blue-400' },
    { title: 'Active Suppliers', value: '48', change: '+5', icon: Truck, color: 'text-green-400' },
    { title: 'Total Items', value: '1,247', change: '+12', icon: Archive, color: 'text-purple-400' },
    { title: 'Purchase Orders', value: '89', change: '-3', icon: FileText, color: 'text-orange-400' },
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    { id: '1', user: 'John Doe', action: 'Created new warehouse', timestamp: '2 hours ago', status: 'success' },
    { id: '2', user: 'Jane Smith', action: 'Updated supplier info', timestamp: '4 hours ago', status: 'success' },
    { id: '3', user: 'Bob Johnson', action: 'Deleted purchase order', timestamp: '6 hours ago', status: 'error' },
    { id: '4', user: 'Alice Brown', action: 'Added new item', timestamp: '8 hours ago', status: 'success' },
    { id: '5', user: 'Charlie Wilson', action: 'Modified UOM settings', timestamp: '1 day ago', status: 'pending' },
  ]);

  const systemHealth = {
    database: 'Operational',
    api: 'Operational',
    services: 'Operational',
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update stats randomly for demo
      setStats(prev => prev.map(stat => ({
        ...stat,
        value: (parseInt(stat.value) + Math.floor(Math.random() * 10 - 5)).toString(),
        change: Math.random() > 0.5 ? `+${Math.floor(Math.random() * 5)}` : `-${Math.floor(Math.random() * 3)}`,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 md:px-8">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400 text-lg">Welcome to Nimbus Admin Dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-6 border border border-slate-700 hover:border-slate-600 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <h3 className="text-lg font-semibold text-white">{stat.title}</h3>
                </div>
                <div className={`text-sm font-medium ${stat.change?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* System Health */}
          <div className="bg-slate-800 rounded-xl p-6 border border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Activity className="h-6 w-6 mr-2 text-green-400" />
              System Health
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Database</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  systemHealth.database === 'Operational' 
                    ? 'bg-green-900 text-green-400' 
                    : 'bg-red-900 text-red-400'
                }`}>
                  {systemHealth.database}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">API</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  systemHealth.api === 'Operational' 
                    ? 'bg-green-900 text-green-400' 
                    : 'bg-red-900 text-red-400'
                }`}>
                  {systemHealth.api}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Services</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  systemHealth.services === 'Operational' 
                    ? 'bg-green-900 text-green-400' 
                    : 'bg-red-900 text-red-400'
                }`}>
                  {systemHealth.services}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-slate-800 rounded-xl p-6 border border border-slate-700 lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-blue-400" />
              Recent Activities
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/50">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-900' : 
                      activity.status === 'error' ? 'bg-red-900' : 'bg-yellow-900'
                    }`}>
                      {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                      {activity.status === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
                      {activity.status === 'pending' && <Clock className="h-4 w-4 text-yellow-400" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{activity.user}</p>
                    <p className="text-xs text-slate-400">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;