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

const SalesReceivedPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { sales, vendors, milkTypes, updateSalesStatus, vehicleNumbers, drivers } = useData();
    const history = useHistory();
    
    const sale = sales.find(s => s.id === Number(id));
    
    // Editable sale fields
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
    const [tdsAmount, setTdsAmount] = useState(0);
    const [fixedCost, setFixedCost] = useState(0);
    const [kmCharges1, setKmCharges1] = useState(0);
    const [kmCharges2, setKmCharges2] = useState(0);
    const [kmCharges3, setKmCharges3] = useState(0);
    const [tollGateCharges, setTollGateCharges] = useState(0);
    const [excludingKm, setExcludingKm] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [tdsDeduction, setTdsDeduction] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (sale) {
            // Initialize editable fields from sale data
            setReceivedDate(sale.date);
            setVendorId(sale.vendorId);
            setVehicleNumber(sale.vehicleNumber || '');
            setDriverName(sale.driverName || '');
            setDriverMobile(sale.driverMobile || '');
            setState(sale.state);
            
            // Initialize delivery lines (editable copy)
            setDeliveryLines([...sale.lines]);
            
            // Initialize received lines from delivery lines
            const initialized = sale.lines.map(line => ({
                ...line,
                price: 0,
                amount: 0
            }));
            setReceivedLines(initialized);
        }
    }, [sale]);

    if (!sale) {
        return (
            <div style={{ padding: 16 }}>
                <h2>Sale not found</h2>
                <button onClick={() => history.push('/sales')}>Back to Sales List</button>
            </div>
        );
    }

    const vendor = vendors.find(v => v.id === sale.vendorId);

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

    // Auto-calculate Fixed when TS changes
    useEffect(() => {
        if (tdsAmount && tdsAmount > 0) {
            const calculatedFixed = (receivedSolid * tdsAmount) / 100;
            setFixedCost(Number(calculatedFixed.toFixed(3)));
        }
    }, [tdsAmount, receivedSolid]);

    // Calculate billing amounts
    const totalLiter = receivedTotals.ltr;
    const tsTotal = fixedCost * totalLiter; // Total TS amount = Fixed * Total Liters
    const kmTotal = kmCharges1 * kmCharges3; // Total KM amount = KM × KM Price
    const transportAmount = kmTotal + tollGateCharges; // Transport Amount = KM Total + Toll Gate
    const totalAmount = receivedLines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
    const grossAmount = totalAmount + tsTotal + (excludingKm ? 0 : transportAmount); // Subtract transport if excluding KM
    const netAmount = grossAmount - discount - tdsDeduction;

    const handleDeliveryLineChange = (id: string, key: keyof PurchaseLine, value: string | number) => {
        setDeliveryLines(prev => 
            prev.map(line => {
                if (line.id !== id) return line;
                const updated = { ...line };
                
                if (key === 'kgQty' || key === 'clr') {
                    const kgQty = key === 'kgQty' ? Number(value) : updated.kgQty;
                    const clr = key === 'clr' ? Number(value) : updated.clr;
                    if (key === 'kgQty') updated.kgQty = kgQty;
                    if (key === 'clr') updated.clr = clr;
                    
                    // Sales calculation: Liter = KG / (1.0 + CLR/1000)
                    if (kgQty > 0 && clr > 0) {
                        const density = 1.0 + (clr / 1000);
                        updated.ltr = Number((kgQty / density).toFixed(2));
                    } else {
                        updated.ltr = 0;
                    }
                } else if (key === 'fat') {
                    updated.fat = Number(value);
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
                } else if (key === 'kgQty' || key === 'clr') {
                    const kgQty = key === 'kgQty' ? Number(value) : updated.kgQty;
                    const clr = key === 'clr' ? Number(value) : updated.clr;
                    if (key === 'kgQty') updated.kgQty = kgQty;
                    if (key === 'clr') updated.clr = clr;
                    
                    // Sales calculation: Liter = KG / (1.0 + CLR/1000)
                    if (kgQty > 0 && clr > 0) {
                        const density = 1.0 + (clr / 1000);
                        updated.ltr = Number((kgQty / density).toFixed(2));
                    } else {
                        updated.ltr = 0;
                    }
                    updated.amount = updated.price * updated.ltr;
                } else if (key === 'fat') {
                    updated.fat = Number(value);
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
        if (window.confirm('Are you sure you want to accept this sale? This will update the status to Accepted.')) {
            try {
                await updateSalesStatus(sale.id, 'Accepted');
                setMessage('Sale accepted successfully!');
                setTimeout(() => {
                    history.push('/sales');
                }, 1500);
            } catch (error) {
                console.error('Failed to accept sale:', error);
                setMessage('Failed to accept sale');
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
                            📦 Sales Received
                        </h2>
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                            Invoice: {sale.invoiceNo}
                        </span>
                    </div>
                    <button
                        onClick={() => history.push('/sales')}
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

                {/* Editable Sale Details - Two Column Layout */}
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
                                label="Sales To (Customer) *"
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
                                placeholder="Search customer..."
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
                                    Delivery To
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
                        <div style={{ 
                            background: '#ffffff',
                            padding: '6px',
                            borderRadius: '8px',
                            border: '2px solid #e5e7eb',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            {/* Header: Billing Information */}
                            <div style={{ 
                                textAlign: 'center', 
                                marginBottom: 4, 
                                paddingBottom: 3, 
                                borderBottom: '2px solid #377df4' 
                            }}>
                                <h3 style={{ 
                                    fontSize: 12, 
                                    fontWeight: 700, 
                                    color: '#377df4', 
                                    margin: 0,
                                    letterSpacing: 0.3
                                }}>
                                    BILLING INFORMATION
                                </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {/* 1st Row: Total LTR */}
                                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px', gap: 8, alignItems: 'center' }}>
                                    <div></div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#377df4', textAlign: 'center' }}>Total LTR</label>
                                    <input
                                        type="text"
                                        value={formatNumber(totalLiter, 2)}
                                        readOnly
                                        style={{ 
                                            padding: '3px 8px', 
                                            border: '2px solid #377df4', 
                                            borderRadius: 4, 
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            textAlign: 'right',
                                            background: '#ffffff',
                                            color: '#377df4'
                                        }}
                                    />
                                </div>

                                {/* 2nd Row: TS and Fixed */}
                                <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px 140px 140px', gap: 6, alignItems: 'center' }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#377df4' }}>TS</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={tdsAmount}
                                        onChange={(e) => setTdsAmount(Number(e.target.value))}
                                        style={{ 
                                            padding: '4px 8px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '12px',
                                            textAlign: 'right'
                                        }}
                                    />
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#377df4', textAlign: 'right' }}>Fixed</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={fixedCost}
                                        onChange={(e) => setFixedCost(Number(e.target.value))}
                                        style={{ 
                                            padding: '4px 8px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '12px',
                                            textAlign: 'right'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={formatNumber(tsTotal, 2)}
                                        readOnly
                                        style={{ 
                                            padding: '4px 8px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textAlign: 'right',
                                            background: '#f9fafb'
                                        }}
                                    />
                                </div>

                                {/* 3rd Row: KM */}
                                <div style={{ display: 'grid', gridTemplateColumns: '60px 100px 80px 100px 1fr 140px', gap: 6, alignItems: 'center' }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#377df4' }}>KM</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={kmCharges1}
                                        onChange={(e) => setKmCharges1(Number(e.target.value))}
                                        style={{ 
                                            padding: '4px 8px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '12px',
                                            textAlign: 'right'
                                        }}
                                    />
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#377df4' }}>KM Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={kmCharges3}
                                        onChange={(e) => setKmCharges3(Number(e.target.value))}
                                        style={{ 
                                            padding: '4px 8px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '12px',
                                            textAlign: 'right'
                                        }}
                                    />
                                    <div></div>
                                    <input
                                        type="text"
                                        value={formatNumber(kmCharges1 * kmCharges3, 2)}
                                        readOnly
                                        style={{ 
                                            padding: '4px 8px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textAlign: 'right',
                                            background: '#f9fafb'
                                        }}
                                    />
                                </div>

                                {/* 4th Row: Toll Gate */}
                                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px', gap: 8, alignItems: 'center' }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#377df4' }}>Toll Gate</label>
                                    <div></div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={tollGateCharges}
                                        onChange={(e) => setTollGateCharges(Number(e.target.value))}
                                        style={{ 
                                            padding: '4px 8px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '12px',
                                            textAlign: 'right'
                                        }}
                                    />
                                </div>

                                {/* 5th Row: Transport Amount */}
                                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px', gap: 8, alignItems: 'center' }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#377df4' }}>Transport Amount</label>
                                    <div></div>
                                    <input
                                        type="text"
                                        value={formatNumber(transportAmount, 2)}
                                        readOnly
                                        style={{ 
                                            padding: '4px 8px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textAlign: 'right',
                                            background: '#f9fafb',
                                            color: '#64748b'
                                        }}
                                    />
                                </div>

                                {/* 6th Row: Excluding KM and Gross Amount */}
                                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px', gap: 8, alignItems: 'center', paddingTop: 2, borderTop: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <input
                                            type="checkbox"
                                            id="excludingKmCheck"
                                            checked={excludingKm}
                                            onChange={(e) => setExcludingKm(e.target.checked)}
                                            style={{ width: 16, height: 16 }}
                                        />
                                        <label htmlFor="excludingKmCheck" style={{ fontSize: 12, fontWeight: 600, color: '#377df4' }}>Excluding KM</label>
                                    </div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#e91e8c', textAlign: 'center' }}>Gross Amount</label>
                                    <input
                                        type="text"
                                        value={formatNumber(grossAmount, 2)}
                                        readOnly
                                        style={{ 
                                            padding: '3px 8px', 
                                            border: '2px solid #e91e8c', 
                                            borderRadius: 4, 
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            textAlign: 'right',
                                            background: '#ffffff',
                                            color: '#e91e8c'
                                        }}
                                    />
                                </div>

                                {/* 7th Row: Discount */}
                                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px', gap: 8, alignItems: 'center' }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#377df4' }}>Discount</label>
                                    <div></div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={discount}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                        style={{ 
                                            padding: '6px 10px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '13px',
                                            textAlign: 'right'
                                        }}
                                    />
                                </div>

                                {/* 8th Row: TDS */}
                                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px', gap: 8, alignItems: 'center' }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#377df4' }}>TDS</label>
                                    <div></div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={tdsDeduction}
                                        onChange={(e) => setTdsDeduction(Number(e.target.value))}
                                        style={{ 
                                            padding: '6px 10px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: 4, 
                                            fontSize: '13px',
                                            textAlign: 'right'
                                        }}
                                    />
                                </div>

                                {/* 9th Row: Net Amount */}
                                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px', gap: 8, alignItems: 'center', paddingTop: 2, borderTop: '1px solid #e5e7eb' }}>
                                    <div></div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#e91e8c', textAlign: 'center' }}>Net Amount</label>
                                    <input
                                        type="text"
                                        value={formatNumber(netAmount, 2)}
                                        readOnly
                                        style={{ 
                                            padding: '8px 12px', 
                                            border: '2px solid #e91e8c', 
                                            borderRadius: 4, 
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            textAlign: 'right',
                                            background: '#ffffff',
                                            color: '#e91e8c'
                                        }}
                                    />
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
                        ✓ Accept Sale
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

export default SalesReceivedPage;
