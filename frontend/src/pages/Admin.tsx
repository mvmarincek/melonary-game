import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { t } from '../i18n/translations';

interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalScore: number;
  dailyNewUsers: number;
  dailyGamesPlayed: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  x_username?: string;
  tiktok_username?: string;
  language: string;
  total_score: number;
  current_phase: number;
  games_played: number;
  highest_combo: number;
  created_at: string;
  last_login: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function Admin() {
  const { user, language } = useStore();
  const [tab, setTab] = useState<'dashboard' | 'users'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (tab === 'dashboard') {
      fetchStats();
    } else {
      fetchUsers();
    }
  }, [tab, pagination.page]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getStats() as AdminStats;
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getUsers(pagination.page, pagination.limit, search) as any;
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await api.admin.exportUsers();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `melonary-users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export users:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-melonary-darker to-melonary-dark">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-melonary-gold hover:underline text-sm">
            &larr; Back
          </Link>
          <h1 className="text-xl font-bold text-melonary-gold">
            {t('menu.admin', language)}
          </h1>
          <div className="w-16"></div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-4 py-2 rounded-lg transition ${
              tab === 'dashboard'
                ? 'bg-melonary-gold text-melonary-dark'
                : 'bg-melonary-dark text-gray-400 hover:text-melonary-gold'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg transition ${
              tab === 'users'
                ? 'bg-melonary-gold text-melonary-dark'
                : 'bg-melonary-dark text-gray-400 hover:text-melonary-gold'
            }`}
          >
            Users
          </button>
        </div>

        {tab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              isLoading={isLoading}
            />
            <StatCard
              title="Total Games"
              value={stats?.totalGames || 0}
              isLoading={isLoading}
            />
            <StatCard
              title="Total Score"
              value={stats?.totalScore || 0}
              isLoading={isLoading}
            />
            <StatCard
              title="New Users Today"
              value={stats?.dailyNewUsers || 0}
              isLoading={isLoading}
              highlight
            />
            <StatCard
              title="Games Today"
              value={stats?.dailyGamesPlayed || 0}
              isLoading={isLoading}
              highlight
            />
          </div>
        )}

        {tab === 'users' && (
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-gold px-6">
                  Search
                </button>
              </form>
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="btn-outline whitespace-nowrap"
              >
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-400">
                {t('game.loading', language)}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-melonary-gold/20">
                        <th className="pb-2 px-2">Username</th>
                        <th className="pb-2 px-2">Name</th>
                        <th className="pb-2 px-2">Email</th>
                        <th className="pb-2 px-2">Score</th>
                        <th className="pb-2 px-2">Phase</th>
                        <th className="pb-2 px-2">Games</th>
                        <th className="pb-2 px-2">Joined</th>
                        <th className="pb-2 px-2">Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-melonary-gold/10 hover:bg-melonary-dark/50">
                          <td className="py-2 px-2 text-melonary-gold">{u.username}</td>
                          <td className="py-2 px-2">{u.name}</td>
                          <td className="py-2 px-2 text-gray-400">{u.email}</td>
                          <td className="py-2 px-2 font-bold">{u.total_score.toLocaleString()}</td>
                          <td className="py-2 px-2">{u.current_phase}</td>
                          <td className="py-2 px-2">{u.games_played}</td>
                          <td className="py-2 px-2 text-gray-400 text-xs">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-2 text-gray-400 text-xs">
                            {new Date(u.last_login).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-gray-400">
                    Showing {users.length} of {pagination.total} users
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 bg-melonary-dark rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 text-gray-400">
                      {pagination.page} / {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 bg-melonary-dark rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  isLoading,
  highlight,
}: {
  title: string;
  value: number;
  isLoading: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`card ${highlight ? 'border-melonary-gold' : ''}`}>
      <div className="text-sm text-gray-400 mb-2">{title}</div>
      {isLoading ? (
        <div className="h-8 bg-melonary-dark/50 animate-pulse rounded" />
      ) : (
        <div className={`text-2xl font-bold ${highlight ? 'text-melonary-gold' : 'text-white'}`}>
          {value.toLocaleString()}
        </div>
      )}
    </div>
  );
}
