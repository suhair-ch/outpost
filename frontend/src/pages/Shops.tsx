
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Phone } from 'lucide-react';
import client from '../api/client';
import LocationSelector from '../components/LocationSelector';

const Shops = () => {
    const navigate = useNavigate();
    const [shops, setShops] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        mobileNumber: '',
        district: '',
        area: '', // Add Area
        commission: 0,
        isHub: false
    });

    const fetchShops = async () => {
        try {
            const { data } = await client.get('/shops');
            setShops(data);
        } catch (error) {
            console.error('Failed to fetch shops', error);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/shops', formData);
            setShowModal(false);
            setFormData({ shopName: '', ownerName: '', mobileNumber: '', district: '', area: '', commission: 0, isHub: false });
            fetchShops(); // Refresh list
        } catch (error: any) {
            alert(error.response?.data?.details || 'Failed to create shop');
        }
    };

    const filteredShops = shops.filter(s =>
        s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Shops</h1>
                {localStorage.getItem('role') === 'DISTRICT_ADMIN' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        Add Shop
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search shops..."
                    className="input-field"
                    style={{ paddingLeft: '3rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>

            {/* Shop Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredShops.map((shop) => (
                    <div key={shop.id} className="glass-panel card" style={shop.isHub ? { border: '2px solid #3b82f6' } : {}}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3 style={{ margin: 0, color: 'white' }}>{shop.shopName}</h3>
                                {shop.isHub && <span title="Mini Hub" style={{ fontSize: '1.2rem' }}>🏢</span>}
                            </div>
                            <span style={{
                                padding: '0.25rem 0.5rem', borderRadius: '4px',
                                background: shop.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: shop.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                                fontSize: '0.8rem', fontWeight: 600
                            }}>
                                {shop.status}
                            </span>
                        </div>

                        <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>👤</div>
                                {shop.ownerName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={16} />
                                {shop.mobileNumber}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={16} />
                                {shop.district}
                            </div>
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                Commission: <span style={{ color: 'var(--success)' }}>₹{shop.commission}</span> per parcel
                            </div>
                            <button
                                className="btn"
                                style={{ marginTop: '1rem', width: '100%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                                onClick={() => navigate(`/shops/${shop.id}/settlements`)}
                            >
                                💰 Financials & Debt
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '500px', padding: '2rem', background: '#1e293b' }}>
                        <h2 style={{ color: 'white' }}>Create New Shop</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input required placeholder="Shop Name" className="input-field" value={formData.shopName} onChange={e => setFormData({ ...formData, shopName: e.target.value })} />
                                <input required placeholder="Owner Name" className="input-field" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Location</label>
                                <LocationSelector
                                    className="location-selector"
                                    onSelect={(loc) => setFormData({ ...formData, district: loc.district, area: loc.area })}
                                />
                                {formData.area && <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.2rem' }}>Selected: {formData.area}, {formData.district}</div>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <input required placeholder="Mobile Number" className="input-field" value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="number" placeholder="Commission (₹)" className="input-field" style={{ flex: 1 }} value={formData.commission} onChange={e => setFormData({ ...formData, commission: Number(e.target.value) })} />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isHub} onChange={e => setFormData({ ...formData, isHub: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                                    Is Mini Hub?
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" style={{ background: 'var(--bg-card)', color: 'white', flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Shop</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shops;
