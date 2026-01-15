import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, History, Truck } from 'lucide-react';

const ShopDashboard = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>HOME</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '3rem' }}>Select an action to proceed.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div
                    className="glass-panel"
                    style={{ padding: '2.5rem', cursor: 'pointer', transition: 'transform 0.2s', textAlign: 'center' }}
                    onClick={() => navigate('/book-parcel')}
                >
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', marginInline: 'auto' }}>
                        <Package size={32} color="#10b981" />
                    </div>
                    <h2>Book Parcel</h2>
                </div>

                <div
                    className="glass-panel"
                    style={{ padding: '2.5rem', cursor: 'pointer', transition: 'transform 0.2s', textAlign: 'center' }}
                    onClick={() => navigate('/deliver-parcel')}
                >
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', marginInline: 'auto' }}>
                        <Truck size={32} color="#3b82f6" />
                    </div>
                    <h2>Deliver</h2>
                </div>

                <div
                    className="glass-panel"
                    style={{ padding: '2.5rem', cursor: 'pointer', transition: 'transform 0.2s', textAlign: 'center' }}
                    onClick={() => navigate('/settlements')}
                >
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', marginInline: 'auto' }}>
                        <DollarSign size={32} color="#f59e0b" />
                    </div>
                    <h2>My Wallet</h2>
                </div>

                <div
                    className="glass-panel"
                    style={{ padding: '2.5rem', cursor: 'pointer', transition: 'transform 0.2s', textAlign: 'center' }}
                    onClick={() => navigate('/parcels')}
                >
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', marginInline: 'auto' }}>
                        <History size={32} color="#a855f7" />
                    </div>
                    <h2>All Parcels</h2>
                </div>
            </div>
        </div>
    );
};

export default ShopDashboard;
