
import { useEffect, useState } from 'react';
import { TrendingUp, Package } from 'lucide-react';
import client from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await client.get('/dashboard/districts');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Calculate Totals
    const totalRevenue = stats.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalParcels = stats.reduce((acc, curr) => acc + curr.count, 0);

    // Sort for Charts (Top 5 Districts)
    const topDistricts = [...stats].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={32} color="var(--primary)" />
                Executive Dashboard
            </h1>

            {loading ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '4rem' }}>Loading Analytics...</div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Total Revenue</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>₹{totalRevenue.toLocaleString()}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Total Parcels</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{totalParcels.toLocaleString()}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Across 14 Districts</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Active Districts</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.filter(d => d.count > 0).length} / 14</div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

                        {/* Revenue by District Bar Chart */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Top Revenue Districts</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topDistricts} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="district" type="category" width={100} tick={{ fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                        formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                                    />
                                    <Bar dataKey="revenue" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Parcel Volume Pie Chart */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Volume Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={topDistricts}
                                        dataKey="count"
                                        nameKey="district"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                    >
                                        {topDistricts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Original Table */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Detailed Breakdown</h3>
                        {/* Use existing table logic, just wrapping it */}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-dim)' }}>
                                    <th style={{ padding: '1rem' }}>Rank</th>
                                    <th style={{ padding: '1rem' }}>District</th>
                                    <th style={{ padding: '1rem' }}>Revenue (₹)</th>
                                    <th style={{ padding: '1rem' }}>Volume</th>
                                    <th style={{ padding: '1rem', width: '30%' }}>Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((item, index) => {
                                    const maxRevenue = Math.max(...stats.map(s => s.revenue), 1);
                                    return (
                                        <tr key={item.district} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold', color: index < 3 ? '#f59e0b' : 'inherit' }}>
                                                #{index + 1}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 500 }}>
                                                {item.district}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#10b981', fontWeight: 600 }}>
                                                ₹{item.revenue.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Package size={16} />
                                                {item.count}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${(item.revenue / maxRevenue) * 100}%`,
                                                        background: 'linear-gradient(90deg, var(--primary), #a855f7)',
                                                        height: '100%',
                                                        borderRadius: '10px'
                                                    }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default Analytics;
