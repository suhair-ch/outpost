
import { useState } from 'react';
import { Package, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import LocationSelector from '../components/LocationSelector';

const BookParcel = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        senderName: '', senderMobile: '',
        receiverName: '', receiverMobile: '',
        destinationDistrict: '', destinationArea: '',
        parcelSize: 'S', price: 50, paymentMode: 'CASH'
    });

    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastBookedParcel, setLastBookedParcel] = useState<any>(null);

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await client.post('/parcels', formData);
            setLastBookedParcel(data);
            setShowSuccessModal(true);
            setFormData({ senderName: '', senderMobile: '', receiverName: '', receiverMobile: '', destinationDistrict: '', destinationArea: '', parcelSize: 'S', price: 50, paymentMode: 'CASH' });
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to book parcel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ background: 'var(--bg-glass)', padding: '0.5rem' }}>← Back</button>
                <h1>Book New Parcel</h1>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Sender Details</label>
                            <input className="input-field" placeholder="Sender Name" required value={formData.senderName} onChange={e => setFormData({ ...formData, senderName: e.target.value })} style={{ marginBottom: '0.5rem' }} />
                            <input className="input-field" placeholder="Sender Mobile" required value={formData.senderMobile} onChange={e => setFormData({ ...formData, senderMobile: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Receiver Details</label>
                            <input className="input-field" placeholder="Receiver Name" required value={formData.receiverName} onChange={e => setFormData({ ...formData, receiverName: e.target.value })} style={{ marginBottom: '0.5rem' }} />
                            <input className="input-field" placeholder="Receiver Mobile" required value={formData.receiverMobile} onChange={e => setFormData({ ...formData, receiverMobile: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Destination</label>
                        <LocationSelector
                            className="location-selector"
                            onSelect={(loc) => setFormData({ ...formData, destinationDistrict: loc.district, destinationArea: loc.area })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Size</label>
                            <select className="input-field" value={formData.parcelSize} onChange={e => setFormData({ ...formData, parcelSize: e.target.value })}>
                                <option value="S">Small (S)</option>
                                <option value="M">Medium (M)</option>
                                <option value="L">Large (L)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Payment</label>
                            <select className="input-field" value={formData.paymentMode} onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}>
                                <option value="CASH">Cash</option>
                                <option value="UPI">UPI</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Price (₹)</label>
                            <input className="input-field" type="number" placeholder="Price" required value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }} disabled={loading}>
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>

            {showSuccessModal && lastBookedParcel && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ textAlign: 'center' }}>
                        <div style={{ margin: '0 auto 1rem', width: '60px', height: '60px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={32} color="white" />
                        </div>
                        <h2>Booking Confirmed!</h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Tracking ID: <strong>{lastBookedParcel.trackingNumber}</strong></p>
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

                        <button
                            className="btn"
                            onClick={() => window.open(`/print-label/${lastBookedParcel.id}`, '_blank')}
                            style={{ width: '100%', background: 'var(--primary)', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <Printer size={20} />
                            Print Shipping Label
                        </button>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn" onClick={() => setShowSuccessModal(false)} style={{ flex: 1, background: 'var(--bg-dark)' }}>Book Another</button>
                            <button className="btn btn-primary" onClick={() => navigate('/shop-dashboard')} style={{ flex: 1 }}>Go Home</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookParcel;
