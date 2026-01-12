import { useEffect, useState } from 'react';
import { IndianRupee, CheckCircle } from 'lucide-react';
import client from '../api/client';
import { Role } from '../types';

const Settlements = () => {
    const [shops, setShops] = useState<any[]>([]);
    const [selectedShopId, setSelectedShopId] = useState<string>('');
    const [earnings, setEarnings] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.role);
            // If Shop Owner, auto-select their shop (using ID from local storage or fetching list)
            if (user.role === Role.SHOP) {
                // In a real app we'd have shopId in user object clearly. 
                // We'll fetch the shop list (which should only return their shop due to previous security rules? 
                // Actually listShops in 'shopController' isn't filtered yet! 
                // But for now, let's just find the shop that matches the user's mobile?
                // OR better: The token update we did earlier put 'shopId' in the token/response. 
                // But localStorage 'user' might not have it if they didn't re-login properly or if we didn't update the frontend logic to save 'shopId' explicitly?
                // The 'login' response sends { token, user, shopId }. 'user' object in DB doesn't have shopId.
                // Let's rely on finding their shop from the /shops list which is easiest for MVP frontend fix.
            }
        }

        client.get('/shops').then(res => {
            setShops(res.data);
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role === Role.SHOP) {
                    // Find shop by mobile number since specific shopId might not be in 'user' object
                    const myShop = res.data.find((s: any) => s.mobileNumber === user.mobile);
                    if (myShop) {
                        setSelectedShopId(myShop.id.toString());
                    }
                }
            }
        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!selectedShopId) {
            setEarnings(null);
            return;
        }
        fetchEarnings(selectedShopId);
    }, [selectedShopId]);

    const fetchEarnings = async (id: string) => {
        setLoading(true);
        try {
            const { data } = await client.get(`/shops/${id}/earnings`);
            setEarnings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async () => {
        if (!selectedShopId || !earnings) return;
        const amount = prompt("Enter amount to settle:", "100"); // MVP simplified flow
        if (!amount) return;

        try {
            await client.post('/settlements/mark-paid', {
                shopId: Number(selectedShopId),
                amount: Number(amount),
                periodStart: new Date(), // Mock dates for MVP
                periodEnd: new Date()
            });
            alert('Settlement marked as PAID');
            fetchEarnings(selectedShopId); // Refresh
        } catch (error) {
            alert('Failed to update settlement');
        }
    };

    return (
        <div>
            <h1>{userRole === Role.SHOP ? 'My Earnings' : 'Settlements'}</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                {userRole === Role.SHOP ? 'View your commission history and payouts.' : 'Manage payouts for mobile shop partners.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: userRole === Role.SHOP ? '1fr' : 'minmax(250px, 1fr) 2fr', gap: '2rem' }}>

                {/* Shop Selector - Only for Admin */}
                {userRole !== Role.SHOP && (
                    <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Select Shop</h3>
                        <select
                            className="input-field"
                            value={selectedShopId}
                            onChange={e => setSelectedShopId(e.target.value)}
                        >
                            <option value="">-- Choose Shop --</option>
                            {shops.map(shop => (
                                <option key={shop.id} value={shop.id}>{shop.shopName} ({shop.ownerName})</option>
                            ))}
                        </select>

                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <small style={{ color: 'var(--text-dim)' }}>Commission Rate</small>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {selectedShopId ? `₹${shops.find(s => s.id.toString() === selectedShopId)?.commission || 0} / parcel` : '--'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Earnings & History */}
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>
                    {!selectedShopId ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                            Select a shop to view settlements
                        </div>
                    ) : loading ? (
                        <div>Loading...</div>
                    ) : !earnings ? (
                        <div style={{ color: '#ef4444' }}>Failed to load earnings data.</div>
                    ) : (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                                    <small style={{ color: 'var(--text-dim)' }}>Total Parcels</small>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{earnings.stats.totalParcels}</div>
                                </div>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                                    <small style={{ color: 'var(--text-dim)' }}>Total Earnings</small>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>₹{earnings.stats.totalEarnings}</div>
                                </div>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                                    <small style={{ color: 'var(--text-dim)' }}>Pending Payout</small>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>₹{earnings.stats.pendingAmount}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>Payout History</h2>
                                    <p style={{ margin: 0, color: 'var(--text-dim)' }}>{earnings?.shop?.shopName}</p>
                                </div>
                                {userRole === Role.ADMIN && (
                                    <button className="btn btn-primary" onClick={handleMarkPaid}>
                                        <IndianRupee size={18} />
                                        Mark Settlement Paid
                                    </button>
                                )}
                            </div>

                            {/* Settlements List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {(earnings?.settlements || []).length === 0 ? (
                                    <p style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>No settlement history found.</p>
                                ) : (
                                    earnings.settlements.map((s: any) => (
                                        <div key={s.id} style={{
                                            padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                                                    <CheckCircle color="#10b981" size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>₹{s.totalCommission} Paid</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                                        {new Date(s.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: '#10b981', color: 'white', fontWeight: 'bold' }}>
                                                {s.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settlements;
