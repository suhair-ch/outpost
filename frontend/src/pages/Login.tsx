
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Lock } from 'lucide-react';
import client from '../api/client';

import { Role } from '../types';

const Login = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    // const [password, setPassword] = useState(''); // Removing Password logic for simple MVP OTP flow unless requested
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await client.post('/auth/send-otp', { mobile });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Login with OTP
            const { data } = await client.post('/login', { mobile, otp });

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

                <form onSubmit={step === 1 ? handleSendOtp : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {step === 1 && (
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
                    )}

                    {step === 2 && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Enter OTP</label>
                            <div className="input-field" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem' }}>
                                <Lock size={16} color="var(--text-dim)" />
                                <input
                                    type="text"
                                    style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }}
                                    placeholder="Enter 4-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ justifyContent: 'center', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (step === 1 ? 'Get OTP' : 'Login')}
                    </button>

                    {step === 2 && (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            Change Mobile Number
                        </button>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                        New Partner? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create Account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
