
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, Check } from 'lucide-react';
import client from '../api/client';

const CreateRoute = () => {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState<any[]>([]);
    const [parcels, setParcels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        routeName: '',
        driverId: ''
    });

    const [selectedParcels, setSelectedParcels] = useState<number[]>([]);

    useEffect(() => {
        // Fetch Drivers
        client.get('/drivers').then(res => setDrivers(res.data));

        // Fetch Available Parcels (Status = BOOKED, not yet assigned? Backend logic for "unassigned" needed?)
        // Currently /parcels returns all. We should filter for 'BOOKED' status in frontend for MVP.
        client.get('/parcels').then(res => {
            const booked = res.data.filter((p: any) => p.status === 'BOOKED');
            setParcels(booked);
        });
    }, []);

    const toggleParcel = (id: number) => {
        if (selectedParcels.includes(id)) {
            setSelectedParcels(selectedParcels.filter(p => p !== id));
        } else {
            setSelectedParcels([...selectedParcels, id]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Route
            const { data: route } = await client.post('/routes/create', {
                routeName: formData.routeName,
                driverId: formData.driverId
            });

            // 2. Assign Parcels
            // We do this in parallel for speed
            const assignmentPromises = selectedParcels.map(parcelId =>
                client.post('/routes/assign-parcel', {
                    routeId: route.id,
                    parcelId: parcelId
                })
            );

            await Promise.all(assignmentPromises);

            alert('Route Created Successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create route', error);
            alert('Failed to create route');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1>Create New Route</h1>
                <p style={{ color: 'var(--text-dim)' }}>Assign parcels to a driver for delivery.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Left Column: Route Details */}
                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={20} color="var(--primary)" />
                        Route Details
                    </h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Route Name</label>
                        <input
                            required
                            className="input-field"
                            placeholder="e.g. Morning Run - District A"
                            value={formData.routeName}
                            onChange={e => setFormData({ ...formData, routeName: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assign Driver</label>
                        <select
                            required
                            className="input-field"
                            value={formData.driverId}
                            onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                        >
                            <option value="">Select Driver</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.mobile})</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                        disabled={loading || selectedParcels.length === 0}
                    >
                        {loading ? 'Creating...' : `Create Route with ${selectedParcels.length} Parcels`}
                    </button>
                    {selectedParcels.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.5rem', textAlign: 'center' }}>Select at least one parcel.</p>}
                </div>

                {/* Right Column: Parcel Selection */}
                <div className="glass-panel" style={{ padding: '2rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={20} color="var(--primary)" />
                        Select Parcels ({selectedParcels.length})
                    </h3>

                    {parcels.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No available parcels to assign.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {parcels.map(parcel => (
                                <div
                                    key={parcel.id}
                                    onClick={() => toggleParcel(parcel.id)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius)',
                                        border: `1px solid ${selectedParcels.includes(parcel.id) ? 'var(--primary)' : 'var(--glass-border)'}`,
                                        background: selectedParcels.includes(parcel.id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'white' }}>{parcel.destinationDistrict}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>From: {parcel.sourceShop?.shopName}</div>
                                    </div>
                                    {selectedParcels.includes(parcel.id) && <div style={{ background: 'var(--primary)', borderRadius: '50%', padding: '2px' }}><Check size={14} color="white" /></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateRoute;
