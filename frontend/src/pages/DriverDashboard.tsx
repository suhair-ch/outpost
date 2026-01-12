
import { useEffect, useState } from 'react';
import client from '../api/client';
import { Truck, MapPin, CheckCircle, Store } from 'lucide-react';

const DriverDashboard = () => {
    const [activeRoute, setActiveRoute] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    // const [stats, setStats] = useState({ assigned: 0, delivered: 0, pending: 0 }); // Unused
    // const [routes, setRoutes] = useState<any[]>([]); // Unused
    const [selectedParcelId, setSelectedParcelId] = useState('');
    const [otp, setOtp] = useState('');

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const { data } = await client.get('/routes');
            setRoutes(data);
            // Auto-select the first open route
            const open = data.find((r: any) => r.status === 'OPEN');
            if (open) setActiveRoute(open);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickup = async (parcelId: number) => {
        try {
            await client.patch(`/parcels/${parcelId}/status`, { status: 'COLLECTED_FROM_SHOP' });
            alert('Parcel Picked Up');
            fetchRoutes(); // Refresh
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const openDeliverModal = (parcelId: string) => {
        setSelectedParcelId(parcelId);
        setOtp('');
        setShowOtpModal(true);
    };

    const handleDeliver = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/parcels/verify-delivery', {
                id: selectedParcelId,
                otp: otp
            });
            alert('Parcel Delivered Successfully!');
            setShowOtpModal(false);
            fetchRoutes(); // Refresh
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to verify OTP');
        }
    };

    return (
        <div>
            <h1>Driver Dashboard</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Manage your daily deliveries.</p>

            {loading ? (
                <p>Loading routes...</p>
            ) : !activeRoute ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <Truck size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No Active Routes Found</h3>
                    <p>Ask admin to assign a route to you.</p>
                </div>
            ) : (
                <div>
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{activeRoute.routeName}</h2>
                                <p style={{ margin: 0, color: 'var(--text-dim)' }}>Assigned Route</p>
                            </div>
                            <span style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                                {activeRoute.status}
                            </span>
                        </div>
                    </div>

                    <h3>My Stops</h3>
                    <div style={{ display: 'grid', gap: '2rem', marginTop: '1rem' }}>
                        {Object.values(activeRoute.parcels.reduce((acc: any, parcel: any) => {
                            const shopId = parcel.sourceShopId;
                            if (!acc[shopId]) {
                                acc[shopId] = {
                                    shop: parcel.sourceShop,
                                    parcels: []
                                };
                            }
                            acc[shopId].parcels.push(parcel);
                            return acc;
                        }, {})).map((group: any) => (
                            <div key={group.shop.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Store size={20} color="var(--primary)" />
                                        {group.shop.shopName}
                                    </h3>
                                    <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                        <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {group.shop.district}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {group.parcels.map((parcel: any) => (
                                        <div key={parcel.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>#{parcel.id} to {parcel.receiverName}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                                    {parcel.destinationDistrict} | ₹{parcel.price}
                                                </div>
                                                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '0.2rem', display: 'inline-block' }}>
                                                    {parcel.status}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {/* Pickup Action */}
                                                {['BOOKED', 'DISPATCHED'].includes(parcel.status) && (
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                                                        onClick={() => handlePickup(parcel.id)}
                                                    >
                                                        Pickup
                                                    </button>
                                                )}

                                                {/* Delivery Action */}
                                                {['DISPATCHED', 'COLLECTED_FROM_SHOP'].includes(parcel.status) && (
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                                                        onClick={() => openDeliverModal(parcel.id.toString())}
                                                    >
                                                        Deliver
                                                    </button>
                                                )}

                                                {parcel.status === 'DELIVERED' && (
                                                    <CheckCircle size={20} color="#10b981" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Delivery</h2>
                        <form onSubmit={handleDeliver} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p>Enter the OTP provided by the receiver for Parcel #{selectedParcelId}.</p>
                            <input className="input-field" placeholder="Enter 4-digit OTP" required value={otp} onChange={e => setOtp(e.target.value)} />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" onClick={() => setShowOtpModal(false)} style={{ background: 'var(--bg-dark)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
