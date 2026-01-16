import { useState } from 'react';
import { X, Shield, User, Lock, Save, Phone, MapPin, Briefcase } from 'lucide-react';
import client from '../api/client';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
    const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const district = localStorage.getItem('district') || user.district || 'Kerala';

    // Password State
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

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
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>

            <div style={{
                width: '100%', maxWidth: '500px',
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                position: 'relative',
                animation: 'scaleIn 0.2s ease-out'
            }} onClick={e => e.stopPropagation()}>

                {/* Header with Pattern */}
                <div style={{
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                    position: 'relative',
                    color: 'white'
                }}>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '1.5rem', right: '1.5rem',
                        background: 'rgba(255,255,255,0.2)', border: 'none',
                        color: 'white', borderRadius: '50%', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        <X size={18} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '4rem', height: '4rem',
                            background: 'white', color: '#4f46e5',
                            borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 'bold',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                        }}>
                            {user?.mobile?.slice(-2) || 'MY'}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>My Profile</h2>
                            <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Manage your account settings</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                        onClick={() => setActiveTab('details')}
                        style={{
                            flex: 1, padding: '1rem',
                            background: activeTab === 'details' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            color: activeTab === 'details' ? '#fff' : '#94a3b8',
                            border: 'none', borderBottom: activeTab === 'details' ? '2px solid #6366f1' : '2px solid transparent',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <User size={18} /> Account Details
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        style={{
                            flex: 1, padding: '1rem',
                            background: activeTab === 'security' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            color: activeTab === 'security' ? '#fff' : '#94a3b8',
                            border: 'none', borderBottom: activeTab === 'security' ? '2px solid #6366f1' : '2px solid transparent',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <Shield size={18} /> Security
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>

                    {activeTab === 'details' ? (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 500 }}>User Role</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Briefcase size={20} className="text-indigo-400" />
                                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>{user.role}</span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 500 }}>Mobile Number</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Phone size={20} className="text-emerald-400" />
                                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>{user.mobile}</span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 500 }}>Assigned Region</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <MapPin size={20} className="text-rose-400" />
                                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>{district}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '1.25rem' }}>
                            {status.msg && (
                                <div style={{
                                    padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem',
                                    background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    color: status.type === 'error' ? '#fca5a5' : '#6ee7b7',
                                    border: status.type === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                                }}>
                                    {status.msg}
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="password" required
                                        value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="password" required minLength={4}
                                        value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                                        placeholder="Min 4 chars"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="password" required minLength={4}
                                        value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                                        placeholder="Retype password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    marginTop: '0.5rem', width: '100%', padding: '0.9rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                    fontSize: '1rem'
                                }}
                            >
                                {loading ? 'Saving...' : <><Save size={18} /> Update Password</>}
                            </button>

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
