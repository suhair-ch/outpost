
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Lock } from 'lucide-react';
import client from '../api/client';

import { Role } from '../types';

const Login = () => {
    // Phase 2: Strict Login Flow (Phone + Password)
    const navigate = useNavigate();
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showSetupModal, setShowSetupModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Login with Password
            const { data } = await client.post('/login', { mobile, password });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.role);
            handleRedirect(data.role);

        } catch (err: any) {
            if (err.response?.data?.error === 'REQUIRE_SETUP') {
                setShowSetupModal(true);
                // Trigger OTP send automatically or ask user? 
                // Let's autopopulate mobile in modal
                client.post('/auth/send-otp', { mobile });
            } else {
                setError(err.response?.data?.error || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRedirect = (role: string) => {
        switch (role) {
            case Role.SUPER_ADMIN:
            case Role.DISTRICT_ADMIN:
            case Role.ADMIN: navigate('/dashboard'); break;
            case Role.SHOP: navigate('/shop-dashboard'); break;
            case Role.DRIVER: navigate('/driver-dashboard'); break;
            default: navigate('/dashboard');
        }
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await client.post('/auth/setup-account', {
                mobile, otp, password: newPassword
            });
            alert('Account Activated Successfully!');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.role);
            handleRedirect(data.role);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Setup failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, #1e293b, #0f172a)'
        }}>
            <div className="glass-panel" style={{ width: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                        borderRadius: '16px', margin: '0 auto 1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Truck size={32} color="white" />
                    </div>
                    <h1>Welcome V2</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Password Login</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mobile Number</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="9999999999"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <div className="input-field" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem' }}>
                            <Lock size={16} color="var(--text-dim)" />
                            <input
                                type="password"
                                style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }}
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ justifyContent: 'center', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                        Have an invite? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Claim Account</Link>
                    </div>
                </form>
            </div>

            {/* Setup Modal */}
            {showSetupModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Setup Account Security</h2>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                            Welcome! Since this is your first login, please verify your mobile and set a secure password.
                        </p>
                        <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mobile OTP (Sent to {mobile})</label>
                                <input className="input-field" placeholder="Enter OTP (1234)" value={otp} onChange={e => setOtp(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>New Secure Password</label>
                                <input className="input-field" type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Activate Account</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
