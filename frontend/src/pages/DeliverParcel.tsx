
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Truck } from 'lucide-react';

const DeliverParcel = () => {
    const navigate = useNavigate();
    const [parcelId, setParcelId] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.post('/parcels/verify-delivery', {
                id: parcelId,
                otp: otp
            });
            alert('Parcel Delivered/Received Successfully!');
            navigate('/shop-dashboard'); // Go back home on success
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ background: 'var(--bg-glass)', padding: '0.5rem' }}>← Back</button>
                <h1>Deliver Parcel</h1>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <Truck size={40} color="#3b82f6" />
                </div>

                <h2 style={{ marginBottom: '1rem' }}>Confirm Receipt</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Enter the Parcel ID and the 4-digit OTP provided by the receiver to confirm delivery.</p>

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Parcel ID</label>
                        <input
                            className="input-field"
                            placeholder="e.g. 101"
                            required
                            value={parcelId}
                            onChange={e => setParcelId(e.target.value)}
                            style={{ fontSize: '1.2rem', padding: '1rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Receiver OTP</label>
                        <input
                            className="input-field"
                            placeholder="Type 4-digit OTP"
                            required
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            style={{ fontSize: '1.2rem', padding: '1rem', letterSpacing: '4px' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Verifying...' : 'Confirm Delivery'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DeliverParcel;
