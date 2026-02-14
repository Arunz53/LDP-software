

import React, { useState } from 'react';
import { useData } from '../context/DataContext';


const Reports: React.FC = () => {
    const { userRole, purchases, sales, vehicles } = useData();
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');
    const [filterDriver, setFilterDriver] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('');
    const [filterCompany, setFilterCompany] = useState('');

    // Helper to get company name from vehicle number
    const getCompanyByVehicle = (vehicleNumber: string): string => {
        const v = vehicles.find(v => v.vehicleNumber === vehicleNumber);
        return v?.transportCompany || '';
    };

    // Combine purchases and sales for transport movement, include all billing info
    const allMovements = [
        ...purchases.map((p) => {
            const km = (p as any).kmCharges1 ?? (p as any).km_charges1 ?? 0;
            const kmPrice = (p as any).kmCharges3 ?? (p as any).km_charges3 ?? 0;
            const tollGate = (p as any).tollGateCharges ?? (p as any).toll_gate_charges ?? 0;
            const transportAmount = km * kmPrice + tollGate;
            return {
                id: `purchase-${p.id}`,
                date: p.date,
                vehicleNumber: p.vehicleNumber || '',
                driverName: p.driverName || '',
                km,
                kmPrice,
                tollGate,
                transportAmount,
                type: 'Purchase',
                company: getCompanyByVehicle(p.vehicleNumber || ''),
            };
        }),
        ...sales.map((s) => {
            const km = (s as any).kmCharges1 ?? (s as any).km_charges1 ?? 0;
            const kmPrice = (s as any).kmCharges3 ?? (s as any).km_charges3 ?? 0;
            const tollGate = (s as any).tollGateCharges ?? (s as any).toll_gate_charges ?? 0;
            const transportAmount = km * kmPrice + tollGate;
            return {
                id: `sale-${s.id}`,
                date: s.date,
                vehicleNumber: s.vehicleNumber || '',
                driverName: s.driverName || '',
                km,
                kmPrice,
                tollGate,
                transportAmount,
                type: 'Sale',
                company: getCompanyByVehicle(s.vehicleNumber || ''),
            };
        }),
    ];

    // Filtering
    const filtered = allMovements.filter((m) => {
        let dateMatch = true;
        if (filterFromDate && filterToDate) {
            dateMatch = m.date >= filterFromDate && m.date <= filterToDate;
        } else if (filterFromDate) {
            dateMatch = m.date >= filterFromDate;
        } else if (filterToDate) {
            dateMatch = m.date <= filterToDate;
        }
        const driverMatch = !filterDriver || m.driverName.toLowerCase().includes(filterDriver.toLowerCase());
        const vehicleMatch = !filterVehicle || m.vehicleNumber.toLowerCase().includes(filterVehicle.toLowerCase());
        const companyMatch = !filterCompany || m.company.toLowerCase().includes(filterCompany.toLowerCase());
        return dateMatch && driverMatch && vehicleMatch && companyMatch;
    });

    if (userRole === 'transport') {
        // Add filter state for Apply/Clear
        const [appliedFilters, setAppliedFilters] = useState({
            from: '',
            to: '',
            driver: '',
            vehicle: '',
            company: ''
        });
        const [typeFilter, setTypeFilter] = useState<'All' | 'Purchase' | 'Sale'>('All');

        const handleApplyFilter = () => {
            setAppliedFilters({
                from: filterFromDate,
                to: filterToDate,
                driver: filterDriver,
                vehicle: filterVehicle,
                company: filterCompany
            });
        };
        const handleClearFilter = () => {
            setFilterFromDate('');
            setFilterToDate('');
            setFilterDriver('');
            setFilterVehicle('');
            setFilterCompany('');
            setAppliedFilters({ from: '', to: '', driver: '', vehicle: '', company: '' });
        };
        const filteredWithApplied = allMovements.filter((m) => {
            let dateMatch = true;
            if (appliedFilters.from && appliedFilters.to) {
                dateMatch = m.date >= appliedFilters.from && m.date <= appliedFilters.to;
            } else if (appliedFilters.from) {
                dateMatch = m.date >= appliedFilters.from;
            } else if (appliedFilters.to) {
                dateMatch = m.date <= appliedFilters.to;
            }
            const driverMatch = !appliedFilters.driver || m.driverName.toLowerCase().includes(appliedFilters.driver.toLowerCase());
            const vehicleMatch = !appliedFilters.vehicle || m.vehicleNumber.toLowerCase().includes(appliedFilters.vehicle.toLowerCase());
            const companyMatch = !appliedFilters.company || m.company.toLowerCase().includes(appliedFilters.company.toLowerCase());
            const typeMatch = typeFilter === 'All' ? true : m.type === typeFilter;
            return dateMatch && driverMatch && vehicleMatch && companyMatch && typeMatch;
        });
        const totalsByCompany: Record<string, { km: number; kmPrice: number; tollGate: number; transportAmount: number }> = {};
        filteredWithApplied.forEach((m) => {
            const company = m.company || 'Unknown';
            if (!totalsByCompany[company]) {
                totalsByCompany[company] = { km: 0, kmPrice: 0, tollGate: 0, transportAmount: 0 };
            }
            totalsByCompany[company].km += Number(m.km) || 0;
            totalsByCompany[company].kmPrice += Number(m.kmPrice) || 0;
            totalsByCompany[company].tollGate += Number(m.tollGate) || 0;
            totalsByCompany[company].transportAmount += Number(m.transportAmount) || 0;
        });

        return (
            <div style={{ padding: 32, background: 'linear-gradient(135deg, #f0f4ff 0%, #e0f7fa 100%)', minHeight: '100vh' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', boxShadow: '0 8px 32px rgba(80,120,200,0.10)', borderRadius: 18, background: '#fff', padding: 32 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: '#377df4', marginBottom: 8, letterSpacing: 0.5, textShadow: '0 2px 8px #e0e7ff' }}>Transport Reports</h1>
                    <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ fontWeight: 600, color: '#64748b' }}>From</label><br />
                            <input type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, background: '#f8fafc' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, color: '#64748b' }}>To</label><br />
                            <input type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, background: '#f8fafc' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, color: '#64748b' }}>Driver</label><br />
                            <input type="text" placeholder="Driver name" value={filterDriver} onChange={e => setFilterDriver(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, background: '#f8fafc' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, color: '#64748b' }}>Vehicle</label><br />
                            <input type="text" placeholder="Vehicle number" value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, background: '#f8fafc' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, color: '#64748b' }}>Company</label><br />
                            <input type="text" placeholder="Company name" value={filterCompany} onChange={e => setFilterCompany(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, background: '#f8fafc' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <button onClick={handleApplyFilter} style={{ marginBottom: 4, padding: '8px 20px', background: '#377df4', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, boxShadow: '0 2px 8px #e0e7ff', cursor: 'pointer' }}>Apply Filter</button>
                            <button onClick={handleClearFilter} style={{ padding: '8px 20px', background: '#e0e7ff', color: '#377df4', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Clear Filter</button>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
                            <label style={{ fontWeight: 600, color: '#64748b' }}>Type</label>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, background: '#f8fafc', fontWeight: 600, color: '#377df4' }}>
                                <option value="All">All</option>
                                <option value="Purchase">Purchase</option>
                                <option value="Sale">Sale</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ff' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 12, overflow: 'hidden', fontSize: 15, boxShadow: '0 2px 8px #e0e7ff' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(90deg, #e0e7ff 0%, #b3e5fc 100%)' }}>
                                    <th style={{ padding: 14, borderBottom: '2px solid #377df4', color: '#377df4', fontWeight: 800 }}>Date</th>
                                    <th style={{ padding: 14, borderBottom: '2px solid #377df4', color: '#377df4', fontWeight: 800 }}>Type</th>
                                    <th style={{ padding: 14, borderBottom: '2px solid #377df4', color: '#377df4', fontWeight: 800 }}>Vehicle Number</th>
                                    <th style={{ padding: 14, borderBottom: '2px solid #377df4', color: '#377df4', fontWeight: 800 }}>Driver Name</th>
                                    <th style={{ padding: 14, borderBottom: '2px solid #377df4', color: '#377df4', fontWeight: 800 }}>Kilometers</th>
                                    <th style={{ padding: 14, borderBottom: '2px solid #377df4', color: '#377df4', fontWeight: 800 }}>KM Price</th>
                                    <th style={{ padding: 14, borderBottom: '2px solid #377df4', color: '#377df4', fontWeight: 800 }}>Toll Gate</th>
                                    <th style={{ padding: 14, borderBottom: '2px solid #377df4', color: '#377df4', fontWeight: 800 }}>Transport Amount</th>
                                    <th style={{ padding: 14, borderBottom: '2px solid #377df4', color: '#377df4', fontWeight: 800 }}>Transport Company</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWithApplied.length === 0 ? (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#64748b', fontSize: 18 }}>No transport data found.</td></tr>
                                ) : (
                                    <>
                                        {filteredWithApplied.map((m) => (
                                            <tr key={m.id} style={{ background: m.type === 'Sale' ? '#f0f4ff' : '#fff' }}>
                                                <td style={{ padding: 12, borderBottom: '1px solid #e0e7ff', color: '#222', fontWeight: 600 }}>{m.date}</td>
                                                <td style={{ padding: 12, borderBottom: '1px solid #e0e7ff', color: m.type === 'Sale' ? '#e91e63' : '#377df4', fontWeight: 700 }}>{m.type}</td>
                                                <td style={{ padding: 12, borderBottom: '1px solid #e0e7ff', color: '#222' }}>{m.vehicleNumber}</td>
                                                <td style={{ padding: 12, borderBottom: '1px solid #e0e7ff', color: '#222' }}>{m.driverName}</td>
                                                <td style={{ padding: 12, borderBottom: '1px solid #e0e7ff', color: '#222', textAlign: 'right' }}>{m.km}</td>
                                                <td style={{ padding: 12, borderBottom: '1px solid #e0e7ff', color: '#222', textAlign: 'right' }}>{m.kmPrice}</td>
                                                <td style={{ padding: 12, borderBottom: '1px solid #e0e7ff', color: '#222', textAlign: 'right' }}>{m.tollGate}</td>
                                                <td style={{ padding: 12, borderBottom: '1px solid #e0e7ff', color: '#222', textAlign: 'right' }}>{m.transportAmount}</td>
                                                <td style={{ padding: 12, borderBottom: '1px solid #e0e7ff', color: '#222' }}>{m.company}</td>
                                            </tr>
                                        ))}
                                        {/* Totals row(s) */}
                                        {Object.entries(totalsByCompany).map(([company, totals]) => (
                                            <tr key={company + '-totals'} style={{ background: '#e0f7fa', fontWeight: 'bold' }}>
                                                <td colSpan={4} style={{ padding: 12, borderTop: '2px solid #377df4', textAlign: 'right', color: '#377df4', fontWeight: 800 }}>Total for {company}:</td>
                                                <td style={{ padding: 12, borderTop: '2px solid #377df4', textAlign: 'right', color: '#377df4', fontWeight: 800 }}>{totals.km}</td>
                                                <td style={{ padding: 12, borderTop: '2px solid #377df4', textAlign: 'right', color: '#377df4', fontWeight: 800 }}>{totals.kmPrice}</td>
                                                <td style={{ padding: 12, borderTop: '2px solid #377df4', textAlign: 'right', color: '#377df4', fontWeight: 800 }}>{totals.tollGate}</td>
                                                <td style={{ padding: 12, borderTop: '2px solid #377df4', textAlign: 'right', color: '#377df4', fontWeight: 800 }}>{totals.transportAmount}</td>
                                                <td style={{ padding: 12, borderTop: '2px solid #377df4' }}></td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Default: Lab Reports
    return (
        <div>
            <h1>Lab Reports</h1>
            {/* Add functionality to display lab reports and other relevant data here */}
        </div>
    );
};

export default Reports;