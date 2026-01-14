import { useState, useEffect } from 'react';
import client from '../api/client';
import { Plus, Search } from 'lucide-react';

const Areas = () => {
    const [areas, setAreas] = useState<any[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Filters
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Form
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        pincode: '',
        district: ''
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    // Fetch Initial Data
    useEffect(() => {
        const init = async () => {
            try {
                const [distRes, areaRes] = await Promise.all([
                    client.get('/locations/districts'),
                    client.get('/locations/areas')
                ]);
                setDistricts(distRes.data);
                setAreas(areaRes.data);

                // If District Admin, pre-set district
                if (!isSuperAdmin && user.district) {
                    setFormData(prev => ({ ...prev, district: user.district }));
                    setSelectedDistrict(user.district);
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await client.post('/locations/areas', formData);
            setAreas([...areas, data]); // Optimistic update
            setShowModal(false);
            setFormData({ name: '', code: '', pincode: '', district: isSuperAdmin ? '' : user.district });
            alert('Area Created Successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to create area');
        }
    };

    // Filter Logic
    const filteredAreas = areas.filter(area => {
        const matchesDistrict = selectedDistrict ? area.district === selectedDistrict : true;
        const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            area.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            area.pincode?.includes(searchTerm);
        return matchesDistrict && matchesSearch;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Area Management</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage Post Offices and Tracking Codes</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Add Area
                </button>
            </div>

            {/* Filters */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        className="input-field"
                        placeholder="Search by Name, Code or Pincode..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>

                <select
                    className="input-field"
                    style={{ width: '250px' }}
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                >
                    <option value="">All Districts</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)' }}>Area Name</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)' }}>Code</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)' }}>Pincode</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)' }}>District</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredAreas.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No areas found.</td></tr>
                        ) : (
                            filteredAreas.map(area => (
                                <tr key={area.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{area.name}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {area.code ? (
                                            <span style={{
                                                background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8',
                                                padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600
                                            }}>
                                                {area.code}
                                            </span>
                                        ) : <span style={{ color: 'var(--text-dim)' }}>--</span>}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)' }}>{area.pincode || '--'}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{area.district}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ color: '#10b981', fontSize: '0.9rem' }}>● Active</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '450px', padding: '2rem', background: '#1e293b' }}>
                        <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Add New Area</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* District Selection (Only for Super Admin) */}
                            {isSuperAdmin ? (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>District</label>
                                    <select
                                        className="input-field"
                                        value={formData.district}
                                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                                        required
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Adding to District:</span>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.district}</div>
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Area Name</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Tirur"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Area Code</label>
                                    <input
                                        className="input-field"
                                        placeholder="e.g. TRR"
                                        maxLength={4}
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                    />
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Max 4 letters</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Pincode</label>
                                    <input
                                        className="input-field"
                                        placeholder="676101"
                                        value={formData.pincode}
                                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn" style={{ background: 'var(--bg-card)', color: 'white', flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Area</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Areas;
