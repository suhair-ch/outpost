import { useState } from 'react';
import { Shield, User, Lock, Save, Phone, MapPin, Briefcase } from 'lucide-react';
import client from '../api/client';

const Profile = () => {
    const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const district = localStorage.getItem('district') || user.district || 'Kerala';

    // Password State
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });

        if (passwords.new !== passwords.confirm) {
            setStatus({ type: 'error', msg: 'New passwords do not match' });
            return;
        }

        if (passwords.new.length < 4) {
            setStatus({ type: 'error', msg: 'Password must be at least 4 characters' });
            return;
        }

        setLoading(true);
        try {
            await client.post('/auth/change-password', {
                oldPassword: passwords.old,
                newPassword: passwords.new
            });
            setStatus({ type: 'success', msg: 'Password changed successfully!' });
            setPasswords({ old: '', new: '', confirm: '' });
            setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Profile</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Manage your account settings and security</p>
            </div>

            <div style={{
                maxWidth: '800px',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid var(--glass-border)',
                borderRadius: '24px',
                overflow: 'hidden'
            }}>

                {/* Header with Pattern */}
                <div style={{
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                    display: 'flex', alignItems: 'center', gap: '2rem',
                    color: 'white'
                }}>
                    <div style={{
                        width: '5rem', height: '5rem',
                        background: 'white', color: '#4f46e5',
                        borderRadius: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 'bold',
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3)'
                    }}>
                        {user?.mobile?.slice(-2) || 'MY'}
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{user.role?.replace('_', ' ') || 'User'}</h2>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', opacity: 0.9, fontSize: '0.95rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={14} /> {user.mobile}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={14} /> {district}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                        onClick={() => setActiveTab('details')}
                        style={{
                            flex: 1, padding: '1.25rem',
                            background: activeTab === 'details' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            color: activeTab === 'details' ? '#fff' : '#94a3b8',
                            border: 'none', borderBottom: activeTab === 'details' ? '2px solid #6366f1' : '2px solid transparent',
                            cursor: 'pointer', fontWeight: 600, fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <User size={18} /> Account Details
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        style={{
                            flex: 1, padding: '1.25rem',
                            background: activeTab === 'security' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            color: activeTab === 'security' ? '#fff' : '#94a3b8',
                            border: 'none', borderBottom: activeTab === 'security' ? '2px solid #6366f1' : '2px solid transparent',
                            cursor: 'pointer', fontWeight: 600, fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <Shield size={18} /> Security
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '3rem' }}>

                    {activeTab === 'details' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>User Role</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Briefcase size={24} className="text-indigo-400" />
                                    <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user.role}</span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Mobile Number</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Phone size={24} className="text-emerald-400" />
                                    <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user.mobile}</span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Region</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <MapPin size={24} className="text-rose-400" />
                                    <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{district}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Change Password</h3>

                            <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '1.5rem' }}>
                                {status.msg && (
                                    <div style={{
                                        padding: '1rem', borderRadius: '12px', fontSize: '0.95rem',
                                        background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: status.type === 'error' ? '#fca5a5' : '#6ee7b7',
                                        border: status.type === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                                        textAlign: 'center'
                                    }}>
                                        {status.msg}
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Current Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                        <input
                                            type="password" required
                                            value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                        <input
                                            type="password" required minLength={4}
                                            value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
                                            placeholder="Min 4 chars"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Confirm New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                        <input
                                            type="password" required minLength={4}
                                            value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
                                            placeholder="Retype password"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={loading}
                                    className="btn btn-primary"
                                    style={{
                                        marginTop: '1rem', width: '100%', padding: '1rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                        fontSize: '1.1rem', height: '54px'
                                    }}
                                >
                                    {loading ? 'Updating...' : <><Save size={20} /> Update Password</>}
                                </button>

                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
