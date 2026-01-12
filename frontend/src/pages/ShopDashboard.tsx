import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, History, Truck } from 'lucide-react';
import { useState } from 'react';
import client from '../api/client';

const ShopDashboard = () => {
    const navigate = useNavigate();
    const [showOtpModal, setShowOtpModal] = useState(false);
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
            setShowOtpModal(false);
            setParcelId('');
            setOtp('');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Shop Dashboard</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Welcome back! Manage your parcels and earnings.</p>


            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div
                    className="glass-panel"
                    style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => navigate('/parcels?action=book')}
                >
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Package size={24} color="#10b981" />
                    </div>
                    <h3>Book Parcel</h3>
                    <p style={{ color: 'var(--text-dim)' }}>Create a new delivery request</p>
                </div>

                <div
                    className="glass-panel"
                    style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => setShowOtpModal(true)}
                >
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Truck size={24} color="#3b82f6" />
                    </div>
                    <h3>Deliver the Parcel</h3>
                    <p style={{ color: 'var(--text-dim)' }}>Verify incoming deliveries with OTP</p>
                </div>

                <div
                    className="glass-panel"
                    style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => navigate('/settlements')}
                >
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <DollarSign size={24} color="#f59e0b" />
                    </div>
                    <h3>My Earnings</h3>
                    <p style={{ color: 'var(--text-dim)' }}>Check payments and history</p>
                </div>

                <div
                    className="glass-panel"
                    style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => navigate('/parcels')}
                >
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <History size={24} color="#a855f7" />
                    </div>
                    <h3>Parcel History</h3>
                    <p style={{ color: 'var(--text-dim)' }}>View all past transactions</p>
                </div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Parcel Receipt</h2>
                        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p>Enter Parcel ID and OTP to confirm receipt from Driver.</p>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Parcel ID</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. 101"
                                    required
                                    value={parcelId}
                                    onChange={e => setParcelId(e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>OTP</label>
                                <input
                                    className="input-field"
                                    placeholder="Enter 4-digit OTP"
                                    required
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" onClick={() => setShowOtpModal(false)} style={{ background: 'var(--bg-dark)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Confirm'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recent Activity or other widgets could go here */}
        </div>
    );
};

export default ShopDashboard;
