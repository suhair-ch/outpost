
import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, TrendingUp, Users, MessageCircle } from 'lucide-react';
import client from '../api/client';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="glass-panel" style={{
        padding: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
    }}>
        {/* Glow behind icon */}
        <div style={{
            position: 'absolute', top: '1rem', left: '1rem', width: '60px', height: '60px',
            background: color, filter: 'blur(40px)', opacity: 0.2, borderRadius: '50%'
        }}></div>

        <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
            color: color
        }}>
            <Icon size={28} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
            <h2 style={{ margin: '0.25rem 0 0', fontSize: '2rem', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</h2>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        client.get('/dashboard/today')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!stats) return <div style={{ padding: '2rem', color: 'var(--text-dim)' }}>Loading dashboard analytics...</div>;

    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Overview for <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{date}</span></p>
                </div>
                <button className="btn btn-primary">Download Report</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard title="Total Parcels" value={stats.total} icon={Package} color="#6366f1" />
                <StatCard title="Booked" value={stats.booked} icon={TrendingUp} color="#f59e0b" />
                <StatCard title="Delivered" value={stats.delivered} icon={CheckCircle} color="#10b981" />
                <StatCard title="Active Drivers" value="--" icon={Truck} color="#a855f7" />
            </div>

            {/* Invite Section & Recent Activity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{
                            padding: '1.5rem 2rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px',
                                    background: 'rgba(16, 185, 129, 0.1)', color: '#34d399',
                                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Users size={18} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Invite Network</h3>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', background: 'rgba(15, 23, 42, 0.4)', padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                                New Member Access
                            </span>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <InviteManager />
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{
                            padding: '1.5rem 2rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px',
                                    background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24',
                                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <TrendingUp size={18} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Pending Activations</h3>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem 2rem' }}>
                            <PendingInvitesList />
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3>Recent Activity</h3>
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', marginTop: '6px' }}></div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Parcel Delivered</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>2 mins ago • Trivandrum</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

// Sub-component for Invites (Styled)
const InviteManager = () => {
    const [role, setRole] = useState<string>('');
    const [mobile, setMobile] = useState('');
    const [district, setDistrict] = useState('');
    const [message, setMessage] = useState('');
    const userRole = localStorage.getItem('role') || JSON.parse(localStorage.getItem('user') || '{}')?.role;

    if (userRole !== 'SUPER_ADMIN' && userRole !== 'DISTRICT_ADMIN' && userRole !== 'ADMIN') return null;

    const handleInvite = async (e: any) => {
        e.preventDefault();
        try {
            const finalRole = userRole === 'DISTRICT_ADMIN' ? 'SHOP' : role;
            if (!finalRole) { setMessage('Please select a role'); return; }

            await client.post('/auth/invite', { mobile, role: finalRole, district });
            setMessage(`Success! Invited ${finalRole} (${mobile})`);
            setMobile(''); setDistrict('');
        } catch (err: any) {
            setMessage('Error: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div>
            <form onSubmit={handleInvite} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) auto', gap: '1.5rem', alignItems: 'end' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile Number</label>
                    <div className="input-group" style={{ marginBottom: 0, background: 'rgba(15, 23, 42, 0.4)' }}>
                        <input
                            type="text"
                            className="input-field"
                            value={mobile} onChange={e => setMobile(e.target.value)}
                            placeholder="9944..."
                            required
                            style={{ padding: '0.85rem 1rem', fontSize: '1rem', fontWeight: 500 }}
                        />
                    </div>
                </div>

                {(userRole === 'SUPER_ADMIN') ? (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Role</label>
                        <div className="input-group" style={{ marginBottom: 0, background: 'rgba(15, 23, 42, 0.4)' }}>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    color: 'white',
                                    padding: '0.85rem 1rem',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    width: '100%',
                                    border: 'none',
                                    outline: 'none'
                                }}
                            >
                                <option value="" style={{ background: '#1e293b' }}>Select Role</option>
                                <option value="DISTRICT_ADMIN" style={{ background: '#1e293b' }}>District Admin</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    <div style={{ paddingBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                        Inviting <strong>Shop Owner</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                            Location: Inherited from your District
                        </div>
                    </div>
                )}

                {role === 'DISTRICT_ADMIN' && userRole === 'SUPER_ADMIN' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned District</label>
                        <div className="input-group" style={{ marginBottom: 0, background: 'rgba(15, 23, 42, 0.4)' }}>
                            <select
                                value={district}
                                onChange={e => setDistrict(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    color: 'white',
                                    padding: '0.85rem 1rem',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    width: '100%',
                                    border: 'none',
                                    outline: 'none'
                                }}
                            >
                                <option value="" style={{ background: '#1e293b' }}>Select District</option>
                                {[
                                    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam",
                                    "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasargod"
                                ].map(d => (
                                    <option key={d} value={d} style={{ background: '#1e293b' }}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                        height: '50px',
                        padding: '0 2rem',
                        fontSize: '0.95rem',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Send Invite
                </button>
            </form>
            {message && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: message.startsWith('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: message.startsWith('Error') ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                    color: message.startsWith('Error') ? '#fca5a5' : '#6ee7b7',
                    fontSize: '0.95rem', fontWeight: 500
                }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                    {message}
                </div>
            )}
        </div>
    )
}

// Widget for Pending Invites
const PendingInvitesList = () => {
    const [pendingShops, setPendingShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.get('/shops')
            .then(res => {
                const invited = res.data.filter((s: any) => s.userStatus === 'INVITED');
                setPendingShops(invited);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const sendNudge = (shop: any) => {
        const text = `Hello ${shop.ownerName}, your *${shop.shopName}* account is ready! 🚀\n\nLogin here: http://localhost:5173/login\nMobile: ${shop.mobileNumber}\n\nPlease login to set your secure password.`;
        const url = `https://wa.me/91${shop.mobileNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    if (loading) return <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Loading invites...</div>;
    if (pendingShops.length === 0) return <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic' }}>No pending invites. Everyone is active! 🎉</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingShops.map(shop => (
                <div key={shop.shopCode} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{shop.shopName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span>{shop.ownerName}</span>
                            <span>•</span>
                            <span>{shop.mobileNumber}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => sendNudge(shop)}
                        className="btn"
                        style={{
                            background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)',
                            padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <MessageCircle size={16} />
                        Nudge
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
