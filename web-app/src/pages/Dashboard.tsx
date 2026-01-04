import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { formatNumber } from '../utils/snf';

const Dashboard: React.FC = () => {
    const { vendors, purchases } = useData();
    
    const totalLiters = purchases.reduce(
        (sum, p) => sum + p.lines.reduce((lineSum, l) => lineSum + (l.ltr || 0), 0),
        0
    );
    
    const pendingOrders = purchases.filter(p => p.status === 'Delivered').length;
    const totalRevenue = purchases.length * 8400; // Sample calculation

    const stats = [
        { label: 'MILK COLLECTED', value: `${formatNumber(totalLiters)} L`, subtext: 'Today', color: '#3b82f6' },
        { label: 'VENDORS', value: vendors.length, subtext: 'Active', color: '#10b981' },
        { label: 'ORDERS', value: pendingOrders, subtext: 'Pending', color: '#f59e0b' },
        { label: 'REVENUE', value: `₹${formatNumber(totalRevenue, 0)}`, subtext: 'This month', color: '#8b5cf6' }
    ];

    const recentPurchases = purchases.slice(-5).reverse();

    return (
        <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>Dashboard</h1>
            
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: '#ffffff',
                            borderRadius: 16,
                            padding: 20,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
                        }}
                    >
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>
                            {stat.label}
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, marginBottom: 4 }}>
                            {stat.value}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                            {stat.subtext}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
                {/* Recent Purchases */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
                }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>Recent Purchases</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Date</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Vendor</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Qty (L)</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPurchases.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                                        No purchases yet
                                    </td>
                                </tr>
                            ) : (
                                recentPurchases.map((p) => {
                                    const vendor = vendors.find(v => v.id === p.vendorId);
                                    const totalLtr = p.lines.reduce((sum, l) => sum + l.ltr, 0);
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569' }}>{p.date}</td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                                                {vendor?.name || 'N/A'}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569', textAlign: 'right' }}>
                                                {formatNumber(totalLtr)}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#0f172a', fontWeight: 600, textAlign: 'right' }}>
                                                ₹{formatNumber(totalLtr * 50, 0)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Quick Actions */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
                }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Link
                            to="/vendors"
                            style={{
                                padding: '14px 18px',
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: 14,
                                textAlign: 'center',
                                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            Add Vendor
                        </Link>
                        <Link
                            to="/purchase"
                            style={{
                                padding: '14px 18px',
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: 14,
                                textAlign: 'center',
                                boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)'
                            }}
                        >
                            Record Purchase
                        </Link>
                        <Link
                            to="/reports"
                            style={{
                                padding: '14px 18px',
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: 14,
                                textAlign: 'center',
                                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)'
                            }}
                        >
                            View Reports
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;