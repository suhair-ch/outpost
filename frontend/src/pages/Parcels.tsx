
import { useEffect, useState } from 'react';
import { Search, Filter, Package, MapPin } from 'lucide-react';
import client from '../api/client';

import { useSearchParams } from 'react-router-dom';

const Parcels = () => {
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
        if (searchParams.get('action') === 'book') {
            setShowModal(true);
        }
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

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        senderName: '', senderMobile: '',
        receiverName: '', receiverMobile: '',
        destinationDistrict: '', parcelSize: 'S', price: 50, paymentMode: 'CASH'
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastBookedParcel, setLastBookedParcel] = useState<any>(null);

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await client.post('/parcels', formData);
            setLastBookedParcel(data); // Capture parcel data (with OTP)
            setShowModal(false);
            setShowSuccessModal(true); // Show Success Modal
            setFormData({ senderName: '', senderMobile: '', receiverName: '', receiverMobile: '', destinationDistrict: '', parcelSize: 'S', price: 50, paymentMode: 'CASH' });
            fetchParcels();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to book parcel');
        }
    };

    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [receiveData, setReceiveData] = useState({ parcelId: '', otp: '' });

    const handleReceive = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/parcels/verify-delivery', {
                id: receiveData.parcelId,
                otp: receiveData.otp
            });
            alert('Parcel Delivered Successfully!');
            setShowReceiveModal(false);
            setReceiveData({ parcelId: '', otp: '' });
            fetchParcels();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to verify delivery');
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
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ background: '#10b981', color: 'white' }} onClick={() => setShowReceiveModal(true)}>Receive Parcel (Enter OTP)</button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Book New Parcel</button>
                </div>
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

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Book New Parcel</h2>
                        <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input className="input-field" placeholder="Sender Name" required value={formData.senderName} onChange={e => setFormData({ ...formData, senderName: e.target.value })} />
                                <input className="input-field" placeholder="Sender Mobile" required value={formData.senderMobile} onChange={e => setFormData({ ...formData, senderMobile: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input className="input-field" placeholder="Receiver Name" required value={formData.receiverName} onChange={e => setFormData({ ...formData, receiverName: e.target.value })} />
                                <input className="input-field" placeholder="Receiver Mobile" required value={formData.receiverMobile} onChange={e => setFormData({ ...formData, receiverMobile: e.target.value })} />
                            </div>
                            <input className="input-field" placeholder="Destination District" required value={formData.destinationDistrict} onChange={e => setFormData({ ...formData, destinationDistrict: e.target.value })} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <select className="input-field" value={formData.parcelSize} onChange={e => setFormData({ ...formData, parcelSize: e.target.value })}>
                                    <option value="S">Small (S)</option>
                                    <option value="M">Medium (M)</option>
                                    <option value="L">Large (L)</option>
                                </select>
                                <select className="input-field" value={formData.paymentMode} onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}>
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                </select>
                                <input className="input-field" type="number" placeholder="Price" required value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: 'var(--bg-dark)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showReceiveModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Receive Parcel (Deliver)</h2>
                        <form onSubmit={handleReceive} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p style={{ color: 'var(--text-dim)' }}>Enter the Parcel ID and the OTP provided by the receiver.</p>
                            <input className="input-field" placeholder="Parcel ID" required value={receiveData.parcelId} onChange={e => setReceiveData({ ...receiveData, parcelId: e.target.value })} />
                            <input className="input-field" placeholder="Delivery OTP (4 digits)" required value={receiveData.otp} onChange={e => setReceiveData({ ...receiveData, otp: e.target.value })} />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" onClick={() => setShowReceiveModal(false)} style={{ background: 'var(--bg-dark)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Verify & Deliver</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSuccessModal && lastBookedParcel && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ textAlign: 'center' }}>
                        <div style={{ margin: '0 auto 1rem', width: '60px', height: '60px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={32} color="white" />
                        </div>
                        <h2>Booking Confirmed!</h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Parcel ID: <strong>#{lastBookedParcel.id}</strong></p>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <p style={{ margin: 0, color: 'var(--text-dim)' }}>Share this OTP with the Receiver</p>
                            <h1 style={{ margin: '0.5rem 0 0', letterSpacing: '4px', color: 'var(--primary)' }}>
                                {lastBookedParcel.deliveryOtp}
                            </h1>
                        </div>

                        <a
                            href={`https://wa.me/?text=📦 OutPost Parcel %23${lastBookedParcel.id}%0AUse OTP: *${lastBookedParcel.deliveryOtp}* to receive your delivery.%0AStatus: Booked`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn"
                            style={{ background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', marginBottom: '1rem', textDecoration: 'none' }}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="20" height="20" alt="WhatsApp" />
                            Share on WhatsApp
                        </a>

                        <button className="btn" onClick={() => setShowSuccessModal(false)} style={{ width: '100%', background: 'var(--bg-dark)' }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Parcels;
