import React, { useEffect, useState } from 'react';
import { recycleBinAPI } from '../services/api';
import { formatNumber } from '../utils/snf';

interface DeletedItem {
    id: number;
    invoiceNo: string;
    date: string;
    vendorName: string;
    vendorCode: string;
    type: 'purchase' | 'sale';
    deletedAt: string;
    deletedByUsername: string;
    createdByUsername: string;
    lines: any[];
    status: string;
}

const RecycleBin: React.FC = () => {
    const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'purchases' | 'sales'>('all');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const loadDeletedItems = async () => {
        try {
            setLoading(true);
            const response = await recycleBinAPI.getAll(filter);
            setDeletedItems(response);
        } catch (error) {
            console.error('Failed to load deleted items:', error);
            setMessage('Failed to load deleted items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDeletedItems();
    }, [filter]);

    const handleRestore = async (id: number, type: 'purchase' | 'sale') => {
        if (!window.confirm('Are you sure you want to restore this item?')) {
            return;
        }

        try {
            await recycleBinAPI.restore(id, type);
            setMessage('Item restored successfully');
            loadDeletedItems();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to restore item:', error);
            setMessage('Failed to restore item');
        }
    };

    const handlePermanentDelete = async (id: number, type: 'purchase' | 'sale') => {
        if (!window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone!')) {
            return;
        }

        try {
            await recycleBinAPI.permanentDelete(id, type);
            setMessage('Item permanently deleted');
            loadDeletedItems();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to delete item:', error);
            setMessage('Failed to delete item');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 16 }}>
                <h2>Recycle Bin</h2>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>🗑️ Recycle Bin</h2>
            </div>

            {message && (
                <div style={{ 
                    padding: 12, 
                    marginBottom: 16, 
                    background: message.includes('Failed') ? '#fee2e2' : '#d1fae5', 
                    color: message.includes('Failed') ? '#991b1b' : '#065f46',
                    borderRadius: 8,
                    fontWeight: 500
                }}>
                    {message}
                </div>
            )}

            <div style={{ marginBottom: 16 }}>
                <label style={{ marginRight: 12, fontWeight: 500 }}>Filter by type:</label>
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value as 'all' | 'purchases' | 'sales')}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #d4d7dc',
                        borderRadius: 6,
                        fontSize: 14,
                    }}
                >
                    <option value="all">All</option>
                    <option value="purchases">Purchases Only</option>
                    <option value="sales">Sales Only</option>
                </select>
            </div>

            {deletedItems.length === 0 ? (
                <div style={{ 
                    padding: 48, 
                    textAlign: 'center', 
                    background: '#f8fafc', 
                    borderRadius: 8,
                    color: '#64748b'
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>Recycle Bin is empty</p>
                    <p style={{ fontSize: 14 }}>Deleted purchases and sales will appear here</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8 }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f8fafc' }}>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Type</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Invoice No</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Date</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Vendor</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total LTR</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Status</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Deleted By</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Deleted At</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deletedItems.map((item) => {
                                const totalLtr = item.lines.reduce((sum, l) => sum + (parseFloat(l.ltr) || 0), 0);
                                const formattedDate = new Date(item.date).toLocaleDateString('en-GB');
                                const deletedDate = new Date(item.deletedAt).toLocaleString('en-GB');
                                
                                return (
                                    <tr key={`${item.type}-${item.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 8px', fontSize: 13 }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: 4,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                background: item.type === 'purchase' ? '#dbeafe' : '#fef3c7',
                                                color: item.type === 'purchase' ? '#1e40af' : '#92400e'
                                            }}>
                                                {item.type === 'purchase' ? 'PURCHASE' : 'SALE'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                                            {item.invoiceNo}
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569' }}>
                                            {formattedDate}
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569' }}>
                                            {item.vendorName}
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569', textAlign: 'right' }}>
                                            {formatNumber(totalLtr)}
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: 13 }}>
                                            <span style={{
                                                padding: '3px 8px',
                                                borderRadius: 4,
                                                fontSize: 11,
                                                background: item.status === 'Accepted' ? '#d1fae5' : 
                                                          item.status === 'Rejected' ? '#fee2e2' : '#e0e7ff',
                                                color: item.status === 'Accepted' ? '#065f46' : 
                                                       item.status === 'Rejected' ? '#991b1b' : '#3730a3'
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569' }}>
                                            {item.deletedByUsername || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569' }}>
                                            {deletedDate}
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleRestore(item.id, item.type)}
                                                style={{
                                                    marginRight: 6,
                                                    padding: '4px 8px',
                                                    fontSize: 12,
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => handlePermanentDelete(item.id, item.type)}
                                                style={{
                                                    padding: '4px 8px',
                                                    fontSize: 12,
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete Forever
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RecycleBin;
