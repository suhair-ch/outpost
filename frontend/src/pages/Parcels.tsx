
import { useEffect, useState } from 'react';
import { Search, MapPin, Printer } from 'lucide-react';
import client from '../api/client';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Parcels = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [parcels, setParcels] = useState<any[]>([]);
    const [search, setSearch] = useState(''); // Search State

    const fetchParcels = async (searchQuery = '') => {
        try {
            const url = searchQuery ? `/parcels?search=${searchQuery}` : '/parcels';
            const { data } = await client.get(url);
            setParcels(data);
        } catch (error) {
            console.error('Failed to fetch parcels', error);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchParcels();
    }, [searchParams]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search) fetchParcels(search);
            else fetchParcels();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BOOKED': return '#f59e0b';
            case 'DELIVERED': return '#10b981';
            case 'COLLECTED_FROM_SHOP': return '#6366f1';
            default: return '#94a3b8';
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1>All Parcels</h1>
                    <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', width: '300px' }}>
                        <Search size={18} color="var(--text-dim)" />
                        <input
                            placeholder="Search ID, Mobile, OTP..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                        />
                    </div>
                </div>
                {/* Buttons removed as requested - Actions are now on Home */}
            </div>

            <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-light)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Sender</th>
                            <th style={{ padding: '1rem' }}>Receiver</th>
                            <th style={{ padding: '1rem' }}>Destination</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Price</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parcels.map((parcel) => (
                            <tr key={parcel.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{parcel.id}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div>{parcel.senderName}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{parcel.senderMobile}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div>{parcel.receiverName}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{parcel.receiverMobile}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <MapPin size={14} color="var(--primary)" />
                                        {parcel.destinationDistrict}
                                        {parcel.destinationArea && <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>({parcel.destinationArea})</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '4px',
                                        background: `${getStatusColor(parcel.status)}20`,
                                        color: getStatusColor(parcel.status),
                                        fontSize: '0.8rem', fontWeight: 600
                                    }}>
                                        {parcel.status}
                                    </span>
                                    {/* Admin Status Update Controls */}
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <button
                                            style={{ fontSize: '0.7rem', padding: '2px 6px', cursor: 'pointer', background: 'var(--bg-glass)', color: 'var(--text-light)', border: '1px solid var(--glass-border)', borderRadius: '4px' }}
                                            onClick={async () => {
                                                const newStatus = prompt('Enter new status (COLLECTED_FROM_SHOP, AT_CENTRAL_HUB, DISPATCHED, ARRIVED_AT_DESTINATION, DELIVERED):', parcel.status);
                                                if (newStatus) {
                                                    try {
                                                        await client.patch(`/parcels/${parcel.id}/status`, { status: newStatus });
                                                        fetchParcels();
                                                    } catch (e) { alert('Failed to update'); }
                                                }
                                            }}
                                        >
                                            Update Status
                                        </button>
                                        <button
                                            style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '2px 6px', cursor: 'pointer', background: 'var(--bg-glass)', color: 'var(--text-light)', border: '1px solid var(--glass-border)', borderRadius: '4px' }}
                                            onClick={() => navigate(`/print-label/${parcel.id}`)}
                                        >
                                            <Printer size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                            Print Label
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>₹{parcel.price}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                    {new Date(parcel.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Parcels;
