
import { useEffect, useState } from 'react';
import { Plus, Search, Truck, Phone } from 'lucide-react';
import client from '../api/client';

const Drivers = () => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        mobile: ''
    });

    const fetchDrivers = async () => {
        try {
            const { data } = await client.get('/drivers');
            setDrivers(data);
        } catch (error) {
            console.error('Failed to fetch drivers', error);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/drivers/create', formData);
            setShowModal(false);
            setFormData({ name: '', mobile: '' });
            fetchDrivers();
        } catch (error: any) {
            alert(error.response?.data?.details || 'Failed to create driver');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Drivers</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Add Driver
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {drivers.map((driver) => (
                    <div key={driver.id} className="glass-panel card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Truck color="white" size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{driver.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                    <Phone size={14} />
                                    {driver.mobile}
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>0</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Active Routes</div>
                            </div>
                            <button className="btn" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>View Details</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: '#1e293b' }}>
                        <h2 style={{ color: 'white' }}>Add Driver</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input required placeholder="Driver Name" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input required placeholder="Mobile Number" className="input-field" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" style={{ background: 'var(--bg-card)', color: 'white', flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Driver</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drivers;
