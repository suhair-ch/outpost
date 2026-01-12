
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock } from 'lucide-react';
import client from '../api/client';

import { Role } from '../types';

const Login = () => {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

            // Auto-redirect based on role
            switch (data.role) {
                case Role.SUPER_ADMIN:
                case Role.DISTRICT_ADMIN:
                case Role.ADMIN:
                    navigate('/dashboard');
                    break;
                case Role.SHOP:
                    navigate('/shop-dashboard');
                    break;
                case Role.DRIVER:
                    navigate('/driver-dashboard');
                    break;
                default:
                    navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
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
                    <h1>{step === 1 ? 'Welcome' : 'Verify OTP'}</h1>
                    <p style={{ color: 'var(--text-dim)' }}>{step === 1 ? 'Enter mobile number to continue' : `OTP sent to ${mobile}`}</p>
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
                        Partner Login
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
