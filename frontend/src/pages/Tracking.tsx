
import { useState } from 'react';
import client from '../api/client';
import { Search, Package, MapPin, Calendar, CheckCircle } from 'lucide-react';

const Tracking = () => {
    const [parcelId, setParcelId] = useState('');
    const [parcel, setParcel] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parcelId) return;

        setLoading(true);
        setError('');
        setParcel(null);

        try {
            const { data } = await client.get(`/public/track/${parcelId}`);
            setParcel(data);
        } catch (err) {
            setError('Parcel not found or ID is incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>

            {/* Header */}
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--primary), #a855f7)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Package size={24} color="white" />
                </div>
                <h1>Track Your Parcel</h1>
                <p style={{ color: 'var(--text-dim)' }}>Enter your Parcel ID to see the current status</p>
            </div>

            {/* Search Box */}
            <form onSubmit={handleTrack} style={{ width: '100%', maxWidth: '500px', display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                <input
                    className="input-field"
                    placeholder="Enter Parcel ID (e.g. 1)"
                    value={parcelId}
                    onChange={e => setParcelId(e.target.value)}
                    style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }} disabled={loading}>
                    {loading ? 'Searching...' : <Search size={24} />}
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            {/* Result Card */}
            {parcel && (
                <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--primary)' }}>#{parcel.id}</h2>
                        <p style={{ color: 'var(--text-dim)', margin: '0.5rem 0' }}>Current Status</p>
                        <div style={{
                            display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '20px',
                            background: parcel.status === 'DELIVERED' ? '#10b981' : '#f59e0b',
                            color: 'white', fontWeight: 'bold'
                        }}>
                            {parcel.status.replace(/_/g, ' ')}
                        </div>

                        {/* Resend OTP Action (Mock - would need Auth context to show strictly) */}
                        {/* Since this is public tracking, we shouldn't expose Resend OTP here casually. */}
                        {/* But the user requirement says "DISTRICT ADMIN... Handle OTP failures". */}
                        {/* This should be in the Admin/Shop Parcel View, not public tracking. */}
                        {/* I will add it to Parcels.tsx/Parcels Table, NOT here. */}
                    </div>

                    {/* Visual Timeline */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
                        {/* Line */}
                        <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>

                        {/* Steps */}
                        {[
                            { label: 'Booked', status: ['BOOKED', 'COLLECTED_FROM_SHOP', 'DISPATCHED', 'DELIVERED'] },
                            { label: 'Picked Up', status: ['COLLECTED_FROM_SHOP', 'DISPATCHED', 'DELIVERED'] },
                            { label: 'In Transit', status: ['DISPATCHED', 'DELIVERED'] },
                            { label: 'Delivered', status: ['DELIVERED'] }
                        ].map((step, idx) => {
                            const active = step.status.includes(parcel.status);
                            return (
                                <div key={idx} style={{ position: 'relative', zIndex: 1, textAlign: 'center', flex: 1 }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 1rem',
                                        background: active ? 'var(--primary)' : '#333',
                                        border: active ? '4px solid rgba(139, 92, 246, 0.3)' : '4px solid var(--bg-dark)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {active ? <CheckCircle size={20} color="white" /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#555' }} />}
                                    </div>
                                    <span style={{ color: active ? 'white' : 'var(--text-dim)', fontSize: '0.9rem', fontWeight: active ? 'bold' : 'normal' }}>{step.label}</span>
                                </div>
                            )
                        })}
                    </div>

                    <div style={{ display: 'grid', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-dim)' }}>From</span>
                            <span style={{ fontWeight: 500 }}>{parcel.senderName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-dim)' }}>To</span>
                            <span style={{ fontWeight: 500 }}>{parcel.receiverName} ({parcel.destinationDistrict})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                            <span style={{ color: 'var(--text-dim)' }}>Last Update</span>
                            <span>{new Date(parcel.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tracking;
