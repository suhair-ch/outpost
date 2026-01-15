
import { useState } from 'react';
import client from '../api/client';
import { Search, Package, CheckCircle } from 'lucide-react';

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

    // Calculate Progress Percentage
    const getProgress = (status: string) => {
        switch (status) {
            case 'BOOKED': return 10;
            case 'COLLECTED_FROM_SHOP': return 30;
            case 'AT_CENTRAL_HUB': return 50;
            case 'DISPATCHED': return 75;
            case 'ARRIVED_AT_DESTINATION': return 90;
            case 'DELIVERED': return 100;
            default: return 5;
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
                <p style={{ color: 'var(--text-dim)' }}>Real-time Delivery Updates</p>
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

            {/* Live Tracking Map */}
            {parcel && (
                <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

                    {/* Status Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>#{parcel.id}</h2>
                        <div style={{
                            display: 'inline-block', marginTop: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: '20px',
                            background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)',
                            fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'
                        }}>
                            {parcel.status.replace(/_/g, ' ')}
                        </div>
                    </div>

                    {/* LIVE MAP VISUALIZATION */}
                    <div style={{ position: 'relative', padding: '2rem 1rem', marginBottom: '3rem' }}>

                        {/* The Road */}
                        <div style={{ position: 'relative', height: '8px', background: '#334155', borderRadius: '4px', width: '100%' }}>
                            {/* Progress Bar (Animated) */}
                            <div style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: '4px',
                                background: 'linear-gradient(to right, var(--primary), #a855f7)',
                                width: `${getProgress(parcel.status)}%`,
                                transition: 'width 1.5s ease-in-out',
                                boxShadow: '0 0 15px var(--primary)'
                            }}></div>

                            {/* The Truck (Moves with Progress) */}
                            <div style={{
                                position: 'absolute', top: '50%',
                                left: `${getProgress(parcel.status)}%`,
                                transform: 'translate(-50%, -50%)',
                                transition: 'left 1.5s ease-in-out',
                                zIndex: 10
                            }}>
                                {/* Pulsing Effect */}
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    width: '60px', height: '60px', background: 'var(--primary)',
                                    borderRadius: '50%', opacity: 0.2, animation: 'pulse 2s infinite'
                                }}></div>
                                <div style={{
                                    width: '40px', height: '40px', background: 'var(--bg-elevated)',
                                    borderRadius: '50%', border: '2px solid white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                                }}>
                                    {parcel.status === 'DELIVERED' ? <CheckCircle size={20} color="#10b981" /> :
                                        <div style={{ fontSize: '1.2rem' }}>🚚</div>}
                                </div>
                            </div>

                            {/* Valid Points */}
                            <div style={{ position: 'absolute', left: '0%', top: '16px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Sender</div>
                            <div style={{ position: 'absolute', left: '50%', top: '16px', transform: 'translateX(-50%)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Hub</div>
                            <div style={{ position: 'absolute', right: '0%', top: '16px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Receiver</div>
                        </div>

                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                        <div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>From</div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{parcel.senderName}</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{new Date(parcel.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>To</div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{parcel.receiverName}</div>
                            <div style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{parcel.destinationDistrict}</div>
                        </div>
                    </div>

                    {/* CSS for Pulse */}
                    <style>{`
                        @keyframes pulse {
                            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
                            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default Tracking;
