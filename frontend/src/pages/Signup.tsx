
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShoppingBag, Store, Lock } from 'lucide-react';
import client from '../api/client';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        mobile: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await client.post('/auth/signup', formData);
            alert('Account created successfully! Please login.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)',
            padding: '1rem'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                    }}>
                        <UserPlus size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Partner Sign Up</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Join OUT POST network</p>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem', background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444',
                        marginBottom: '1.5rem', fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    <div className="input-group">
                        <Store size={20} style={{ margin: '0 1rem', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Shop Name"
                            required
                            value={formData.shopName}
                            onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <ShoppingBag size={20} style={{ margin: '0 1rem', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Owner Name"
                            required
                            value={formData.ownerName}
                            onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <span style={{ margin: '0 1rem', fontWeight: 'bold', color: 'var(--text-dim)' }}>+91</span>
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            required
                            maxLength={10}
                            value={formData.mobile}
                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                        />
                    </div>

                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem', textAlign: 'center' }}>
                        Location assigned by Invite
                    </div>

                    <div className="input-group">
                        <Lock size={20} style={{ margin: '0 1rem', color: 'var(--text-dim)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ marginTop: '1rem', padding: '1rem' }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
