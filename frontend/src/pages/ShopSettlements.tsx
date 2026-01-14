
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';

interface Settlement {
    id: number;
    totalCashCollected: number;
    totalCommissionEarned: number;
    netAmountToBePaid: number;
    periodStart: string;
    createdAt: string;
}

interface ShopStats {
    totalCashCollected: number;
    totalCommissionEarned: number;
    netAmountToBePaid: number;
    parcelCount: number;
}

const ShopSettlements: React.FC = () => {
    const { shopId } = useParams<{ shopId: string }>();
    const [stats, setStats] = useState<ShopStats | null>(null);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [shopName, setShopName] = useState('');

    const fetchData = async () => {
        try {
            const res = await client.get(`/shops/${shopId}/earnings`);
            setStats(res.data.unsettledStats);
            setSettlements(res.data.settlements);
            setShopName(res.data.shop.shopName);
        } catch (error) {
            console.error("Failed to fetch settlement data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [shopId]);

    const handleSettle = async () => {
        if (!confirm(`Are you sure you have collected ₹${stats?.netAmountToBePaid}?`)) return;

        try {
            await client.post('/settlements/mark-paid', { shopId });
            alert("Settlement Successful! Books closed.");
            fetchData(); // Refresh to show 0 debt
        } catch (error) {
            alert("Failed to settle. Check console.");
            console.error(error);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">{shopName} - Financials</h1>

            {/* DEBT CARD */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-l-4 border-red-500">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">⚠️ Current Debt (Unsettled)</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-500">Total Cash Collected</p>
                        <p className="text-2xl font-bold text-gray-800">₹{stats?.totalCashCollected}</p>
                        <p className="text-xs text-gray-400">From {stats?.parcelCount} parcels</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-500">Shop Commission</p>
                        <p className="text-2xl font-bold text-green-600">- ₹{stats?.totalCommissionEarned}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded border border-red-200">
                        <p className="text-sm text-red-600 font-bold">NET AMOUNT TO COLLECT</p>
                        <p className="text-3xl font-extrabold text-red-700">₹{stats?.netAmountToBePaid}</p>
                    </div>
                </div>

                {stats && stats.parcelCount > 0 ? (
                    <button
                        onClick={handleSettle}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition duration-200"
                    >
                        Mark ₹{stats.netAmountToBePaid} as COLLECTED
                    </button>
                ) : (
                    <div className="text-center text-gray-500 py-2 bg-gray-100 rounded">
                        No unsettled parcels. All good! 👍
                    </div>
                )}
            </div>

            {/* HISTORY */}
            <h3 className="text-lg font-bold mb-4">Settlement History</h3>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Taken</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {settlements.map((s) => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(s.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    ₹{s.totalCashCollected}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                    ₹{s.totalCommissionEarned}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    ₹{s.netAmountToBePaid}
                                </td>
                            </tr>
                        ))}
                        {settlements.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No history found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShopSettlements;
