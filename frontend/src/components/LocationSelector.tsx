import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import client from '../api/client';

interface LocationSelectorProps {
    onSelect: (data: { district: string; area: string; pincode: string }) => void;
    initialDistrict?: string;
    className?: string;
}

const LocationSelector = ({ onSelect, initialDistrict = '', className }: LocationSelectorProps) => {
    const [districts, setDistricts] = useState<string[]>([]);
    const [areas, setAreas] = useState<any[]>([]);

    const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
    const [selectedArea, setSelectedArea] = useState('');
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);

    // Fetch Districts on Mount
    useEffect(() => {
        setLoadingDistricts(true);
        client.get('/locations/districts')
            .then(res => setDistricts(res.data))
            .catch(err => console.error("Failed to load districts", err))
            .finally(() => setLoadingDistricts(false));
    }, []);

    // Fetch Areas when District changes
    useEffect(() => {
        if (!selectedDistrict) {
            setAreas([]);
            return;
        }
        setLoadingAreas(true);
        client.get(`/locations/areas?district=${selectedDistrict}`)
            .then(res => setAreas(res.data))
            .catch(err => console.error("Failed to load areas", err))
            .finally(() => setLoadingAreas(false));
    }, [selectedDistrict]);

    const handleDistrictChange = (e: any) => {
        const val = e.target.value;
        setSelectedDistrict(val);
        setSelectedArea(''); // Reset area
        // Notify parent, but wait for area selection to be complete? 
        // Or partial upate?
        // Parent expects { district, area, pincode }.
        // We can't give area yet.
    };

    const handleAreaChange = (e: any) => {
        const areaName = e.target.value;
        setSelectedArea(areaName);

        const areaObj = areas.find(a => a.name === areaName);
        if (areaObj) {
            onSelect({
                district: selectedDistrict,
                area: areaObj.name,
                pincode: areaObj.pincode
            });
        }
    };

    return (
        <div className={className} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            {/* District Selector */}
            <div className="input-group">
                <MapPin size={20} style={{ margin: '0 1rem', color: 'var(--text-dim)' }} />
                <select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    className="input-field"
                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.5rem', outline: 'none' }}
                >
                    <option value="" style={{ background: '#1e293b' }}>Select District</option>
                    {loadingDistricts ? (
                        <option value="" style={{ background: '#1e293b' }}>Loading...</option>
                    ) : (
                        districts.map(d => (
                            <option key={d} value={d} style={{ background: '#1e293b' }}>{d}</option>
                        ))
                    )}
                </select>
            </div>

            {/* Area Selector (Only if District Selected) */}
            {selectedDistrict && (
                <div className="input-group">
                    <MapPin size={20} style={{ margin: '0 1rem', color: 'var(--text-dim)' }} />
                    <select
                        value={selectedArea}
                        onChange={handleAreaChange}
                        className="input-field"
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.5rem', outline: 'none' }}
                        disabled={loadingAreas}
                    >
                        <option value="" style={{ background: '#1e293b' }}>Select Area / Post Office</option>
                        {loadingAreas ? (
                            <option value="" style={{ background: '#1e293b' }}>Loading Areas...</option>
                        ) : (
                            areas.map(a => (
                                <option key={a.id} value={a.name} style={{ background: '#1e293b' }}>
                                    {a.name} - {a.pincode}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            )}
        </div>
    );
};

export default LocationSelector;
