
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Map, Truck, Package, CheckCircle, XCircle } from 'lucide-react';
import client from '../api/client';

const Routes = () => {
    const [routes, setRoutes] = useState<any[]>([]);

    const fetchRoutes = async () => {
        try {
            const { data } = await client.get('/routes');
            setRoutes(data);
        } catch (error) {
            console.error('Failed to fetch routes', error);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const handleClose = async (routeId: number) => {
        if (!confirm('Are you sure you want to close this route?')) return;
        try {
            await client.post('/routes/close', { routeId });
            fetchRoutes();
        } catch (error) {
            alert('Failed to close route');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Route Management</h1>
                <Link to="/routes/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    <Plus size={18} />
                    Create New Route
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {routes.map((route) => (
                    <div key={route.id} className="glass-panel card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'white' }}>{route.routeName}</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    {new Date(route.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <span style={{
                                padding: '0.25rem 0.5rem', borderRadius: '4px',
                                background: route.status === 'OPEN' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                color: route.status === 'OPEN' ? '#10b981' : '#94a3b8',
                                height: 'fit-content', fontSize: '0.8rem', fontWeight: 600
                            }}>
                                {route.status}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                                <Truck size={16} color="var(--primary)" />
                                {route.driver?.name || 'Unassigned'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                                <Package size={16} color="var(--warning)" />
                                {route.parcels?.length || 0} Parcels
                            </div>
                        </div>

                        {/* Parcel List (Preview) */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.5rem', marginBottom: '1rem', maxHeight: '100px', overflowY: 'auto' }}>
                            {route.parcels?.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No parcels assigned</span>}
                            {route.parcels?.map((p: any) => (
                                <div key={p.id} style={{ fontSize: '0.8rem', padding: '0.25rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>#{p.id} - {p.destinationDistrict}</span>
                                    <span style={{ color: p.status === 'DELIVERED' ? 'var(--success)' : 'var(--text-dim)' }}>{p.status}</span>
                                </div>
                            ))}
                        </div>

                        {route.status === 'OPEN' && (
                            <button
                                onClick={() => handleClose(route.id)}
                                className="btn"
                                style={{ width: '100%', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                            >
                                <XCircle size={16} />
                                Close Route
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Routes;
