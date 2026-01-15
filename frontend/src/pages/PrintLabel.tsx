
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import { LayoutDashboard, MapPin, Phone, Package, Printer } from 'lucide-react';

const PrintLabel = () => {
    const { id } = useParams();
    const [parcel, setParcel] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParcel = async () => {
            try {
                const { data } = await client.get(`/public/track/${id}`);
                setParcel(data);
            } catch (error) {
                console.error('Failed to load parcel', error);
            } finally {
                setLoading(false);
            }
        };
        fetchParcel();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-white text-center">Loading label...</div>;
    if (!parcel) return <div className="p-8 text-red-400 text-center">Parcel not found</div>;

    // Public Tracking URL
    const trackUrl = `${window.location.origin}/tracking?id=${parcel.id}`;
    // QR Code API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackUrl)}`;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem', color: 'black' }}>

            {/* Screen-only Controls */}
            <div className="no-print" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <button
                    onClick={handlePrint}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.2rem' }}
                >
                    <Printer size={24} />
                    Print Label
                </button>
            </div>

            {/* The Label (4x6 inch ratio approx) */}
            <div style={{
                width: '400px',
                height: '600px',
                background: 'white',
                margin: '0 auto',
                padding: '2rem',
                border: '2px solid black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }} className="print-area">

                {/* Header */}
                <div style={{ borderBottom: '2px solid black', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>OUT POST</h1>
                        <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Express Logistics</p>
                    </div>
                    <div style={{ padding: '0.25rem 0.75rem', border: '2px solid black', borderRadius: '4px', fontWeight: 'bold' }}>
                        PRIORITY
                    </div>
                </div>

                {/* To Address (Big) */}
                <div style={{ padding: '1.5rem 0', flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ship To:</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>{parcel.receiverName}</div>
                    <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{parcel.receiverMobile}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{parcel.destinationDistrict}</div>
                    {parcel.destinationArea && <div style={{ fontSize: '1rem' }}>{parcel.destinationArea}</div>}
                </div>

                {/* Tracking & QR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid black', borderBottom: '2px solid black', padding: '1.5rem 0' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tracking ID</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'monospace' }}>#{parcel.id}</div>
                    </div>
                    <img src={qrUrl} alt="QR" style={{ width: '100px', height: '100px' }} />
                </div>

                {/* From Address (Small) */}
                <div style={{ paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>From:</div>
                    <div style={{ fontWeight: 600 }}>{parcel.senderName}</div>
                    <div style={{ fontSize: '0.9rem' }}>{parcel.senderMobile}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Booked: {new Date(parcel.createdAt).toLocaleDateString()}</div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '1rem' }}>
                    Thank you for using Out Post.
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; margin: 0; border: none; width: 100%; height: 100%; }
                    .no-print { display: none !important; }
                    @page { size: auto; margin: 0mm; }
                }
            `}</style>
        </div>
    );
};

export default PrintLabel;
