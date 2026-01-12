
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Package } from 'lucide-react';
import client from '../api/client';

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

    const maxRevenue = Math.max(...stats.map(s => s.revenue), 1);

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={28} color="var(--primary)" />
                District Performance
            </h1>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {loading ? (
                    <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>Loading Analytics...</div>
                ) : (
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
                            {stats.map((item, index) => (
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
                            ))}
                            {stats.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        No Data Available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Analytics;
