import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useData, todayIso } from '../context/DataContext';
import { formatNumber } from '../utils/snf';
import { PurchaseLine, StateCode } from '../types';
import SearchableDropdown from '../components/SearchableDropdown';

const cellInputStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '80px',
    padding: '6px 8px',
    border: '1px solid #d4d7dc',
    borderRadius: 6,
    boxSizing: 'border-box',
    fontSize: '13px',
};

const readOnlyStyle: React.CSSProperties = {
    ...cellInputStyle,
    background: '#f8fafc',
    color: '#64748b',
};

interface ReceivedLine extends PurchaseLine {
    price: number;
    amount: number;
}

const PurchaseReceivedPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { purchases, vendors, milkTypes, updatePurchaseStatus, vehicleNumbers, drivers } = useData();
    const history = useHistory();
    
    const purchase = purchases.find(p => p.id === Number(id));
    
    // Editable purchase fields
    const [receivedDate, setReceivedDate] = useState('');
    const [vendorId, setVendorId] = useState<number>(0);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverMobile, setDriverMobile] = useState('');
    const [state, setState] = useState<StateCode>('Tamil Nadu');
    
    // State for delivery lines (editable)
    const [deliveryLines, setDeliveryLines] = useState<PurchaseLine[]>([]);
    
    // State for received entry lines (initialized from delivery lines)
    const [receivedLines, setReceivedLines] = useState<ReceivedLine[]>([]);
    
    // Billing information state
    const [includeKmCharges, setIncludeKmCharges] = useState(false);
    const [fixedCost, setFixedCost] = useState(0);
    const [kmCharges, setKmCharges] = useState(0);
    const [tollGateCharges, setTollGateCharges] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [tdsPercent, setTdsPercent] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (purchase) {
            // Initialize editable fields from purchase data
            setReceivedDate(purchase.date);
            setVendorId(purchase.vendorId);
            setVehicleNumber(purchase.vehicleNumber || '');
            setDriverName(purchase.driverName || '');
            setDriverMobile(purchase.driverMobile || '');
            setState(purchase.state);
            
            // Initialize delivery lines (editable copy)
            setDeliveryLines([...purchase.lines]);
            
            // Initialize received lines from delivery lines
            const initialized = purchase.lines.map(line => ({
                ...line,
                price: 0,
                amount: 0
            }));
            setReceivedLines(initialized);
        }
    }, [purchase]);

    if (!purchase) {
        return (
            <div style={{ padding: 16 }}>
                <h2>Purchase not found</h2>
                <button onClick={() => history.push('/purchase')}>Back to Purchase List</button>
            </div>
        );
    }

    const vendor = vendors.find(v => v.id === purchase.vendorId);

    // Calculate delivery totals - ensure arrays are populated
    const deliveryTotals = deliveryLines.length > 0 ? {
        kgQty: deliveryLines.reduce((sum, l) => sum + (Number(l.kgQty) || 0), 0),
        ltr: deliveryLines.reduce((sum, l) => sum + (Number(l.ltr) || 0), 0),
        fat: deliveryLines.reduce((sum, l) => sum + (Number(l.fat) || 0), 0) / deliveryLines.length,
        snf: deliveryLines.reduce((sum, l) => sum + (Number(l.snf) || 0), 0) / deliveryLines.length,
    } : { kgQty: 0, ltr: 0, fat: 0, snf: 0 };
    const deliverySolid = deliveryTotals.fat + deliveryTotals.snf;

    // Calculate received totals - ensure arrays are populated
    const receivedTotals = receivedLines.length > 0 ? {
        kgQty: receivedLines.reduce((sum, l) => sum + (Number(l.kgQty) || 0), 0),
        ltr: receivedLines.reduce((sum, l) => sum + (Number(l.ltr) || 0), 0),
        fat: receivedLines.reduce((sum, l) => sum + (Number(l.fat) || 0), 0) / receivedLines.length,
        snf: receivedLines.reduce((sum, l) => sum + (Number(l.snf) || 0), 0) / receivedLines.length,
    } : { kgQty: 0, ltr: 0, fat: 0, snf: 0 };
    const receivedSolid = receivedTotals.fat + receivedTotals.snf;

    // Calculate billing amounts
    const totalAmount = receivedLines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
    const transportAmount = fixedCost + (includeKmCharges ? kmCharges : 0) + tollGateCharges;
    const grossAmount = totalAmount + transportAmount;
    const tdsAmount = (grossAmount * tdsPercent) / 100;
    const netAmount = grossAmount - discount - tdsAmount;

    const handleDeliveryLineChange = (id: string, key: keyof PurchaseLine, value: string | number) => {
        setDeliveryLines(prev => 
            prev.map(line => {
                if (line.id !== id) return line;
                const updated = { ...line };
                
                if (key === 'kgQty') {
                    updated.kgQty = Number(value);
                    updated.ltr = Number((Number(value) / 1.03 || 0).toFixed(2));
                } else if (key === 'fat' || key === 'clr') {
                    (updated as any)[key] = Number(value);
                    // Recalculate SNF
                    updated.snf = Number(((updated.clr / 4) + (updated.fat * 0.25) + 0.44).toFixed(2));
                } else {
                    (updated as any)[key] = value === '' ? undefined : Number(value);
                }
                
                return updated;
            })
        );
    };

    const handleReceivedLineChange = (id: string, key: keyof ReceivedLine, value: string | number) => {
        setReceivedLines(prev => 
            prev.map(line => {
                if (line.id !== id) return line;
                const updated = { ...line };
                
                if (key === 'price') {
                    updated.price = Number(value);
                    updated.amount = updated.price * updated.ltr;
                } else if (key === 'kgQty') {
                    updated.kgQty = Number(value);
                    updated.ltr = Number((Number(value) / 1.03 || 0).toFixed(2));
                    updated.amount = updated.price * updated.ltr;
                } else if (key === 'fat' || key === 'clr') {
                    (updated as any)[key] = Number(value);
                    // Recalculate SNF
                    updated.snf = Number(((updated.clr / 4) + (updated.fat * 0.25) + 0.44).toFixed(2));
                    updated.amount = updated.price * updated.ltr;
                } else if (key === 'sealNo') {
                    // Handle sealNo as text
                    (updated as any)[key] = value === '' ? undefined : value;
                } else {
                    // Handle other optional numeric fields
                    (updated as any)[key] = value === '' ? undefined : Number(value);
                }
                
                return updated;
            })
        );
    };

    const handleAccept = async () => {
        if (window.confirm('Are you sure you want to accept this purchase? This will update the status to Accepted.')) {
            try {
                await updatePurchaseStatus(purchase.id, 'Accepted');
                setMessage('Purchase accepted successfully!');
                setTimeout(() => {
                    history.push('/purchase');
                }, 1500);
            } catch (error) {
                console.error('Failed to accept purchase:', error);
                setMessage('Failed to accept purchase');
            }
        }
    };

    return (
        <div style={{ 
            background: '#f8fafc',
            padding: '16px',
            minHeight: '100vh'
        }}>
            <div style={{ 
                maxWidth: '1100px',
                margin: '0 auto',
                background: '#ffffff', 
                borderRadius: 12, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '24px'
            }}>
                {/* Header */}
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                    paddingBottom: 16,
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            📦 Purchase Received
                        </h2>
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                            Invoice: {purchase.invoiceNo}
                        </span>
                    </div>
                    <button
                        onClick={() => history.push('/purchase')}
                        style={{
                            padding: '8px 16px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        ← Back to List
                    </button>
                </div>

                {/* Editable Purchase Details - Two Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                Received Date *
                            </label>
                            <input
                                type="date"
                                value={receivedDate}
                                onChange={(e) => setReceivedDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 4,
                                    fontSize: 12
                                }}
                            />
                        </div>
                        <div>
                            <SearchableDropdown
                                label="Purchase From (Vendor) *"
                                options={vendors.map((v) => ({ 
                                    id: v.id, 
                                    label: `${v.code} - ${v.name} (${v.state})` 
                                }))}
                                value={vendorId}
                                onChange={(id: number) => {
                                    setVendorId(id);
                                    const vendor = vendors.find((v) => v.id === id);
                                    if (vendor) {
                                        setState(vendor.state);
                                    }
                                }}
                                placeholder="Search vendor..."
                                fontSize={11}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                    Vehicle Number
                                </label>
                                <input
                                    type="text"
                                    value={vehicleNumber}
                                    onChange={(e) => setVehicleNumber(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 4,
                                        fontSize: 12
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                    Driver Name
                                </label>
                                <input
                                    type="text"
                                    value={driverName}
                                    onChange={(e) => setDriverName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 4,
                                        fontSize: 12
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                    Mobile Number
                                </label>
                                <input
                                    type="text"
                                    value={driverMobile}
                                    onChange={(e) => setDriverMobile(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 4,
                                        fontSize: 12
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                    Delivery From
                                </label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value as StateCode)}
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 4,
                                        fontSize: 12
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout: Left (Delivery + Received) | Right (Billing) */}
                <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', gap: 16, marginBottom: 24 }}>
                    
                    {/* Left Column - Delivery Entry + Received Entry */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        {/* Delivery Entry */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                                    📋 DELIVERY ENTRY
                                </h3>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', background: '#fef3c7', padding: '4px 12px', borderRadius: 6, border: '1px solid #fbbf24' }}>
                                    Solid: {formatNumber(deliverySolid, 2)}
                                </div>
                            </div>
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#ffffff', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '300px' }}>
                                <table style={{ width: 'auto', borderCollapse: 'collapse', fontSize: 11, minWidth: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ padding: '6px 3px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '50px' }}>Comp.</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '100px' }}>Type</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>KG</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>Ltr</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>FAT</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>CLR</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>SNF</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>Temp</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>MBRT</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>Acid</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>COB</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>Alco</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '70px' }}>Adult</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '70px' }}>Seal#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveryLines.map((line) => {
                                            const milkType = milkTypes.find(m => m.id === line.milkTypeId);
                                            const smallInputStyle: React.CSSProperties = {
                                                width: '55px',
                                                padding: '3px 4px',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: 3,
                                                fontSize: '11px',
                                                textAlign: 'right',
                                                boxSizing: 'border-box'
                                            };
                                            return (
                                                <tr key={line.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '6px 3px', color: '#0f172a', fontWeight: 600, fontSize: '11px' }}>{line.compartment}</td>
                                                    <td style={{ padding: '6px 3px', color: '#475569', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={milkType?.name}>{milkType?.name || 'N/A'}</td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.kgQty}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'kgQty', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px', textAlign: 'right', color: '#475569', fontSize: '11px' }}>
                                                        {formatNumber(line.ltr, 1)}
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.fat}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'fat', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.clr}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'clr', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px', textAlign: 'right', color: '#475569', fontSize: '11px' }}>
                                                        {formatNumber(line.snf, 1)}
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.temperature || ''}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'temperature', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.mbrt || ''}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'mbrt', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.acidity || ''}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'acidity', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.cob || ''}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'cob', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.alcohol || ''}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'alcohol', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.adulteration || ''}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'adulteration', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.sealNo || ''}
                                                            onChange={(e) => handleDeliveryLineChange(line.id, 'sealNo', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <tr style={{ background: '#e2e8f0', fontWeight: 700, position: 'sticky', bottom: 0 }}>
                                            <td colSpan={2} style={{ padding: '6px 3px', color: '#0f172a', fontSize: '11px' }}>Delivery Average</td>
                                            <td style={{ padding: '6px 3px', textAlign: 'right', color: '#0f172a', fontSize: '11px' }}>{formatNumber(deliveryTotals.kgQty, 0)}</td>
                                            <td style={{ padding: '6px 3px', textAlign: 'right', color: '#0f172a', fontSize: '11px' }}>{formatNumber(deliveryTotals.ltr, 1)}</td>
                                            <td style={{ padding: '6px 3px', textAlign: 'right', color: '#0f172a', fontSize: '11px' }}>{formatNumber(deliveryTotals.fat, 2)}</td>
                                            <td></td>
                                            <td style={{ padding: '6px 3px', textAlign: 'right', color: '#0f172a', fontSize: '11px' }}>{formatNumber(deliveryTotals.snf, 2)}</td>
                                            <td colSpan={7}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                        {/* Received Entry Below Delivery Entry */}
                        <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                                ✅ RECEIVED ENTRY
                            </h3>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', background: '#d1fae5', padding: '4px 12px', borderRadius: 6, border: '1px solid #10b981' }}>
                                Solid: {formatNumber(receivedSolid, 2)}
                            </div>
                        </div>
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#ffffff', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '300px' }}>
                                <table style={{ width: 'auto', borderCollapse: 'collapse', fontSize: 11, minWidth: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ padding: '6px 3px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '50px' }}>Comp.</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '100px' }}>Type</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>Price</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '70px' }}>Amt</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>KG</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>Ltr</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>FAT</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>CLR</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>SNF</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>Temp</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>MBRT</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>Acid</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>COB</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '60px' }}>Alco</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '70px' }}>Adult</th>
                                            <th style={{ padding: '6px 3px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#475569', borderBottom: '2px solid #e5e7eb', minWidth: '70px' }}>Seal#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receivedLines.map((line) => {
                                            const milkType = milkTypes.find(m => m.id === line.milkTypeId);
                                            const smallInputStyle: React.CSSProperties = {
                                                width: '60px',
                                                padding: '3px 4px',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: 3,
                                                fontSize: '11px',
                                                textAlign: 'right',
                                                boxSizing: 'border-box'
                                            };
                                            return (
                                                <tr key={line.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '6px 3px', color: '#0f172a', fontWeight: 600, fontSize: '11px' }}>{line.compartment}</td>
                                                    <td style={{ padding: '6px 3px', color: '#475569', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={milkType?.name}>{milkType?.name || 'N/A'}</td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.price}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'price', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.amount}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'amount', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.kgQty}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'kgQty', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.ltr}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'ltr', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.fat}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'fat', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.clr}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'clr', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.snf}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'snf', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.temperature || ''}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'temperature', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.mbrt || ''}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'mbrt', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={line.acidity || ''}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'acidity', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.cob || ''}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'cob', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.alcohol || ''}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'alcohol', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.adulteration || ''}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'adulteration', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '6px 3px' }}>
                                                        <input
                                                            type="text"
                                                            value={line.sealNo || ''}
                                                            onChange={(e) => handleReceivedLineChange(line.id, 'sealNo', e.target.value)}
                                                            style={smallInputStyle}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <tr style={{ background: '#e2e8f0', fontWeight: 700, position: 'sticky', bottom: 0 }}>
                                            <td colSpan={2} style={{ padding: '6px 3px', color: '#0f172a', fontSize: '11px' }}>Received Average</td>
                                            <td colSpan={2} style={{ padding: '6px 3px', textAlign: 'right', color: '#0f172a', fontSize: '11px' }}>₹{formatNumber(totalAmount, 0)}</td>
                                            <td style={{ padding: '6px 3px', textAlign: 'right', color: '#0f172a', fontSize: '11px' }}>{formatNumber(receivedTotals.kgQty, 0)}</td>
                                            <td style={{ padding: '6px 3px', textAlign: 'right', color: '#0f172a', fontSize: '11px' }}>{formatNumber(receivedTotals.ltr, 1)}</td>
                                            <td style={{ padding: '6px 3px', textAlign: 'right', color: '#0f172a', fontSize: '11px' }}>{formatNumber(receivedTotals.fat, 2)}</td>
                                            <td></td>
                                            <td style={{ padding: '6px 3px', textAlign: 'right', color: '#0f172a', fontSize: '11px' }}>{formatNumber(receivedTotals.snf, 2)}</td>
                                            <td colSpan={7}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Close Left Column */}
                    </div>

                    {/* Billing Information - Right 50% */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
                            💰 BILLING INFORMATION
                        </h3>
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#ffffff', padding: 16, flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                                {/* Bill Amount and Total LTR */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                            Bill Amount
                                        </label>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                                            ₹{formatNumber(totalAmount, 2)}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                            Total LTR
                                        </label>
                                        <div style={{ fontSize: 18, fontWeight: 900, color: '#d946ef' }}>
                                            {formatNumber(receivedTotals.ltr, 2)}
                                        </div>
                                    </div>
                                </div>

                                {/* TS, Fixed, and result */}
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 80px', gap: 8, alignItems: 'center' }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>TS</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={tdsPercent}
                                        onChange={(e) => setTdsPercent(Number(e.target.value))}
                                        style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: '12px' }}
                                    />
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Fixed</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={fixedCost}
                                        onChange={(e) => setFixedCost(Number(e.target.value))}
                                        style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: '12px', textAlign: 'right' }}
                                    />
                                </div>

                                {/* KM charges */}
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 8, alignItems: 'center' }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>KM</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={kmCharges}
                                        onChange={(e) => setKmCharges(Number(e.target.value))}
                                        disabled={!includeKmCharges}
                                        style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: '12px', opacity: includeKmCharges ? 1 : 0.5 }}
                                    />
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>
                                        {formatNumber(includeKmCharges ? kmCharges : 0, 2)}
                                    </div>
                                </div>

                                {/* Toll Gate */}
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, alignItems: 'center' }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Toll Gate</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={tollGateCharges}
                                        onChange={(e) => setTollGateCharges(Number(e.target.value))}
                                        style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: '12px', textAlign: 'right' }}
                                    />
                                </div>

                                {/* Transport Amount */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9' }}>Transport Amount</label>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0ea5e9', textAlign: 'right' }}>
                                        {formatNumber(transportAmount, 2)}
                                    </div>
                                </div>

                                {/* Excluding KM & Gross Amount */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <input
                                            type="checkbox"
                                            checked={includeKmCharges}
                                            onChange={(e) => setIncludeKmCharges(e.target.checked)}
                                        />
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Excluding KM</label>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#d946ef', display: 'block' }}>Gross Amount</label>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#d946ef', textAlign: 'right' }}>
                                            {formatNumber(grossAmount, 2)}
                                        </div>
                                    </div>
                                </div>

                                {/* Discount */}
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, alignItems: 'center' }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Discount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={discount}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                        style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: '12px', textAlign: 'right' }}
                                    />
                                </div>

                                {/* TDS */}
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, alignItems: 'center' }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>TDS</label>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>
                                        {formatNumber(tdsAmount, 2)}
                                    </div>
                                </div>

                                {/* Net Amount */}
                                <div style={{ background: '#faf5ff', padding: 12, borderRadius: 8, border: '2px solid #d946ef', marginTop: 8 }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#d946ef', display: 'block', marginBottom: 4 }}>
                                        Net Amount
                                    </label>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#d946ef' }}>
                                        {formatNumber(netAmount, 2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accept Button */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16, borderTop: '2px solid #e5e7eb' }}>
                    <button
                        onClick={handleAccept}
                        style={{
                            padding: '14px 48px',
                            background: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                        }}
                    >
                        ✓ Accept Purchase
                    </button>
                </div>

                {message && (
                    <div style={{ 
                        marginTop: 16, 
                        padding: '12px 16px', 
                        background: message.includes('success') ? '#f0fdf4' : '#fef2f2',
                        color: message.includes('success') ? '#15803d' : '#b91c1c',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'center',
                        border: message.includes('success') ? '1px solid #bbf7d0' : '1px solid #fecaca'
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseReceivedPage;
