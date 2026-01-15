
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import client from '../api/client';

const FranchiseReports = () => {
    const [districts, setDistricts] = useState<any[]>([]);
    const [royaltyPercent, setRoyaltyPercent] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await client.get('/dashboard/districts');
            setDistricts(data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = districts.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalRoyalty = (totalRevenue * royaltyPercent) / 100;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BarChart3 className="text-primary" size={32} />
                        Franchise Reports
                    </h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                        Monthly Revenue & Royalty Tracking (Super Admin)
                    </p>
                </div>
            </div>

            {/* Top Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue (All Districts)</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'white' }}>
                                ₹{totalRevenue.toLocaleString()}
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                            <DollarSign size={24} color="#10b981" />
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: '#6366f1', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Total Royalties Owed ({royaltyPercent}%)
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'white' }}>
                                ₹{totalRoyalty.toLocaleString()}
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px' }}>
                            <TrendingUp size={24} color="#6366f1" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ top: '2px', position: 'relative' }}>Royalty Percentage Calculation:</span>
                <input
                    type="number"
                    value={royaltyPercent}
                    onChange={(e) => setRoyaltyPercent(Number(e.target.value))}
                    className="input-field"
                    style={{ width: '80px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>%</span>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-light)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                            <th style={{ padding: '1.5rem' }}>District</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Total Parcels</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Total Revenue</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right', color: '#6366f1' }}>Royalty Share ({royaltyPercent}%)</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right', color: '#10b981' }}>Net District Income</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading report...</td></tr>
                        ) : districts.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No district data found.</td></tr>
                        ) : (
                            districts.map((d, index) => {
                                const royalty = (d.revenue * royaltyPercent) / 100;
                                const net = d.revenue - royalty;
                                return (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1.5rem', fontWeight: 600 }}>{d.district}</td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right' }}>{d.count}</td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 600 }}>₹{d.revenue.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 700, color: '#6366f1' }}>₹{royalty.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>₹{net.toLocaleString()}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FranchiseReports;
