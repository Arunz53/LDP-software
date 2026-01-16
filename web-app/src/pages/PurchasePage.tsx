import React, { useMemo, useState } from 'react';
import { useData, summarizeLiters, todayIso } from '../context/DataContext';
import { computeSnf, formatNumber } from '../utils/snf';
import { PurchaseLine, StateCode } from '../types';
import { useHistory } from 'react-router-dom';
import SearchableDropdown from '../components/SearchableDropdown';

const compartmentOptions: PurchaseLine['compartment'][] = ['Front', 'Middle', 'Back', 'Average'];

const cellInputStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '80px',
    padding: '6px 8px',
    border: '1px solid #d4d7dc',
    borderRadius: 6,
    boxSizing: 'border-box',
    fontSize: '13px',
};

const emptyLine = (milkTypeId: number, compartment: PurchaseLine['compartment']): PurchaseLine => ({
    id: Math.random().toString(36).slice(2),
    compartment,
    milkTypeId,
    kgQty: 0,
    ltr: 0,
    fat: 0,
    clr: 0,
    snf: 0,
});

const PurchasePage: React.FC = () => {
    const { vendors, milkTypes, addPurchase, purchases, updatePurchaseStatus, vehicles, vehicleMasters, getVehicleInfo, vehicleNumbers, drivers } = useData();
    const history = useHistory();
    const defaultState: StateCode = vendors[0]?.state || 'Tamil Nadu';
    const [showForm, setShowForm] = useState(false);
    const [purchaseDate, setPurchaseDate] = useState(todayIso());
    const [city, setCity] = useState('');
    const [state, setState] = useState<StateCode>(defaultState);
    const [vendorId, setVendorId] = useState<number | ''>(vendors[0]?.id ?? '');
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>(undefined);
    const [selectedDriverId, setSelectedDriverId] = useState<number | undefined>(undefined);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverMobile, setDriverMobile] = useState('');
    const [lines, setLines] = useState<PurchaseLine[]>([
        emptyLine(milkTypes[0]?.id || 1, 'Front'),
    ]);
    const [searchVendor, setSearchVendor] = useState('');
    const [message, setMessage] = useState('');
    const [fromDate, setFromDate] = useState(todayIso());
    const [toDate, setToDate] = useState(todayIso());
    const [statusFilter, setStatusFilter] = useState<'All' | 'Delivered' | 'Accepted' | 'Rejected'>('All');
    const [isFiltered, setIsFiltered] = useState(false);

    const filteredVendors = useMemo(
        () =>
            vendors.filter(
                (v) =>
                    v.name.toLowerCase().includes(searchVendor.toLowerCase()) ||
                    v.code.toLowerCase().includes(searchVendor.toLowerCase())
            ),
        [vendors, searchVendor]
    );

    const handleLineChange = (id: string, key: keyof PurchaseLine, value: string) => {
        setLines((prev) =>
            prev.map((line) => {
                if (line.id !== id) return line;
                const updated: PurchaseLine = { ...line };
                if (key === 'milkTypeId') updated.milkTypeId = Number(value);
                else if (key === 'compartment') updated.compartment = value as PurchaseLine['compartment'];
                else {
                    const numeric = Number(value);
                    (updated as any)[key] = numeric;
                }
                if (key === 'kgQty') {
                    updated.ltr = Number((Number(value) / 1.03 || 0).toFixed(2));
                }
                if (key === 'fat' || key === 'clr' || key === 'kgQty' || key === 'compartment' || key === 'milkTypeId') {
                    updated.snf = computeSnf(state, updated.clr, updated.fat);
                }
                return updated;
            })
        );
    };

    const addCompartment = () => {
        if (lines.length >= 4) return;
        const nextCompartment = compartmentOptions[lines.length] || 'Average';
        const firstMilk = milkTypes[0]?.id || 1;
        setLines((prev) => [...prev, emptyLine(firstMilk, nextCompartment)]);
    };

    const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!purchaseDate || !state || !vendorId || lines.length === 0) {
            setMessage('Fill date, state, vendor, and at least one compartment');
            return;
        }
        const invoiceNo = `INV-${Date.now()}`;
        addPurchase({
            invoiceNo,
            date: purchaseDate,
            vendorId: Number(vendorId),
            state,
            vehicleNumber,
            driverName,
            driverMobile,
            status: 'Delivered',
            lines,
        });
        setMessage(`Saved purchase ${invoiceNo}`);
        setShowForm(false);
        // Reset filter to show all purchases including the newly added one
        setIsFiltered(false);
        // Reset form
        setPurchaseDate(todayIso());
        setCity('');
        setVendorId(vendors[0]?.id ?? '');
        setSelectedVehicleId(undefined);
        setSelectedDriverId(undefined);
        setVehicleNumber('');
        setDriverName('');
        setDriverMobile('');
        setLines([emptyLine(milkTypes[0]?.id || 1, 'Front')]);
        setSearchVendor('');
    };

    const filteredPurchases = useMemo(() => {
        // Always show all purchases - no filtering; sort newest first (tie-break by id desc)
        return [...purchases].sort((a, b) => {
            const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (diff !== 0) return diff;
            return (b.id || 0) - (a.id || 0);
        });
    }, [purchases]);

    const totalLiters = filteredPurchases.reduce(
        (sum, p) => sum + p.lines.reduce((lineSum, l) => lineSum + (l.ltr || 0), 0),
        0
    );

    const handleSearch = () => {
        setIsFiltered(true);
    };

    const handleAccept = (id: number) => {
        updatePurchaseStatus(id, 'Accepted');
    };

    if (!showForm) {
        return (
            <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Purchase List</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        + Purchase Entry
                    </button>
                </div>
                
                <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Recent Purchases</h3>
                <p style={{ marginBottom: 8, fontWeight: 600 }}>TOTAL LITER: {formatNumber(totalLiters)}</p>
                <p style={{ padding: 12, background: '#f8fafc', borderRadius: 8, color: '#475569' }}>
                    Purchases will appear here after you save them.
                </p>
                <div style={{ marginTop: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Date</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Vendor</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Invoice No</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>KG</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Qty (LTR)</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>FAT</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>SNF</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>CLR</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPurchases.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                                        No purchases yet
                                    </td>
                                </tr>
                            ) : (
                                filteredPurchases.map((p) => {
                                    const vendor = vendors.find((v) => v.id === p.vendorId);
                                    const totalKg = p.lines.reduce((sum, l) => sum + l.kgQty, 0);
                                    const totalLtr = p.lines.reduce((sum, l) => sum + l.ltr, 0);
                                    const avgFat = p.lines.length > 0 ? p.lines.reduce((sum, l) => sum + l.fat, 0) / p.lines.length : 0;
                                    const avgSnf = p.lines.length > 0 ? p.lines.reduce((sum, l) => sum + l.snf, 0) / p.lines.length : 0;
                                    const avgClr = p.lines.length > 0 ? p.lines.reduce((sum, l) => sum + l.clr, 0) / p.lines.length : 0;
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569' }}>{p.date}</td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                                                {vendor?.name || 'N/A'}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                                                {p.invoiceNo || 'N/A'}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569', textAlign: 'right' }}>
                                                {formatNumber(totalKg)}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569', textAlign: 'right' }}>
                                                {formatNumber(totalLtr)}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569', textAlign: 'right' }}>
                                                {formatNumber(avgFat, 2)}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569', textAlign: 'right' }}>
                                                {formatNumber(avgSnf, 2)}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569', textAlign: 'right' }}>
                                                {formatNumber(avgClr, 2)}
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAccept(p.id)}
                                                    style={{ marginRight: 6, padding: '4px 8px', fontSize: 12, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    style={{ marginRight: 6, padding: '4px 8px', fontSize: 12, background: '#64748b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                >
                                                    Print
                                                </button>
                                                <button
                                                    type="button"
                                                    style={{ padding: '4px 8px', fontSize: 12, background: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                >
                                                    Share
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Purchase Entry</h2>
                <button
                    type="button"
                    onClick={() => {
                        setShowForm(false);
                        setMessage('');
                    }}
                    style={{
                        padding: '8px 16px',
                        background: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    ← Back to List
                </button>
            </div>
            <form onSubmit={handleSave}>
                {/* Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                    <label>
                        Purchase Date*
                        <input
                            aria-label="Purchase date"
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Purchase From city
                        <input
                            aria-label="City"
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Enter city"
                        />
                    </label>

                    <label>
                        State*
                        <select value={state} onChange={(e) => setState(e.target.value as StateCode)}>
                            {['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra'].map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Mobile No
                        <input
                            aria-label="Driver Mobile"
                            value={driverMobile}
                            onChange={(e) => setDriverMobile(e.target.value)}
                        />
                    </label>
                </div>

                {/* Row 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div>
                        <SearchableDropdown
                            label="Purchase From (Vendor) *"
                            options={vendors.map((v) => ({ 
                                id: v.id, 
                                label: `${v.code} - ${v.name} (${v.state})` 
                            }))}
                            value={vendorId ? Number(vendorId) : undefined}
                            onChange={(id: number) => {
                                setVendorId(id);
                                const vendor = vendors.find((v) => v.id === id);
                                if (vendor) {
                                    setState(vendor.state);
                                    setCity(vendor.city);
                                }
                            }}
                            placeholder="Search vendor..."
                        />
                        <button
                            type="button"
                            onClick={() => history.push('/vendors')}
                            style={{
                                marginTop: 6,
                                padding: '6px 12px',
                                background: '#10b981',
                                fontSize: 12,
                                width: '100%',
                            }}
                        >
                            + Add New Vendor
                        </button>
                    </div>

                    <div>
                        <SearchableDropdown
                            label="Driver Name"
                            options={drivers.map((d) => ({ 
                                id: d.id, 
                                label: d.name 
                            }))}
                            value={selectedDriverId}
                            onChange={(id: number) => {
                                setSelectedDriverId(id);
                                const driver = drivers.find((d) => d.id === id);
                                if (driver) {
                                    setDriverName(driver.name);
                                    setDriverMobile(driver.mobile);
                                }
                            }}
                            placeholder="Search driver..."
                        />
                        <button
                            type="button"
                            onClick={() => history.push('/vehicles?tab=drivers')}
                            style={{
                                marginTop: 6,
                                padding: '6px 12px',
                                background: '#10b981',
                                fontSize: 12,
                                width: '100%',
                            }}
                        >
                            + Add New Driver
                        </button>
                    </div>

                    <div>
                        <SearchableDropdown
                            label="Vehicle Number"
                            options={vehicleNumbers.map((vn) => ({ 
                                id: vn.id, 
                                label: vn.number 
                            }))}
                            value={vehicleNumbers.find((vn) => vn.number === vehicleNumber)?.id}
                            onChange={(id: number) => {
                                const vn = vehicleNumbers.find((v) => v.id === id);
                                if (vn) {
                                    setVehicleNumber(vn.number);
                                    setSelectedVehicleId(id);
                                }
                            }}
                            placeholder="Search vehicle..."
                        />
                        <button
                            type="button"
                            onClick={() => history.push('/vehicles')}
                            style={{
                                marginTop: 6,
                                padding: '6px 12px',
                                background: '#10b981',
                                fontSize: 12,
                                width: '100%',
                            }}
                        >
                            + Add New Vehicle
                        </button>
                    </div>
                </div>

                <h3 style={{ marginTop: 16 }}>Milk Details</h3>
                <div style={{ overflowX: 'auto', maxWidth: '100%', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                    <table style={{ width: 'auto', minWidth: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '90px' }}>Compartment</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '120px' }}>Milk Type</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '80px' }}>KG-QTY</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>LTR</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>FAT</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>CLR</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>SNF</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>Temp</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>MBRT</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>Acidity</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>COB</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>Alcohol</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '90px' }}>Adulteration</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}>Seal No</th>
                                <th style={{ padding: '10px 8px', fontSize: '13px', minWidth: '70px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line, idx) => (
                                <tr key={line.id}>
                                    <td style={{ padding: '8px' }}>
                                        <select
                                            aria-label="Compartment"
                                            value={line.compartment}
                                            onChange={(e) => handleLineChange(line.id, 'compartment', e.target.value)}
                                            style={cellInputStyle}
                                        >
                                            {compartmentOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <select
                                            aria-label="Milk Type"
                                            value={line.milkTypeId}
                                            onChange={(e) => handleLineChange(line.id, 'milkTypeId', e.target.value)}
                                            style={cellInputStyle}
                                        >
                                            {milkTypes.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="KG Qty"
                                            type="number"
                                            step="0.01"
                                            value={line.kgQty}
                                            onChange={(e) => handleLineChange(line.id, 'kgQty', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', fontSize: '13px' }}>{formatNumber(line.ltr)}</td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="FAT"
                                            type="number"
                                            step="0.01"
                                            value={line.fat}
                                            onChange={(e) => handleLineChange(line.id, 'fat', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="CLR"
                                            type="number"
                                            step="0.01"
                                            value={line.clr}
                                            onChange={(e) => handleLineChange(line.id, 'clr', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="SNF"
                                            type="number"
                                            step="0.01"
                                            value={line.snf}
                                            disabled
                                            style={{ ...cellInputStyle, background: '#f0f0f0', cursor: 'not-allowed' }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="Temperature"
                                            type="number"
                                            step="0.01"
                                            value={line.temperature ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'temperature', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="MBRT"
                                            type="number"
                                            step="0.01"
                                            value={line.mbrt ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'mbrt', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="Acidity"
                                            type="number"
                                            step="0.01"
                                            value={line.acidity ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'acidity', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="COB"
                                            type="number"
                                            step="0.01"
                                            value={line.cob ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'cob', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="Alcohol"
                                            type="number"
                                            step="0.01"
                                            value={line.alcohol ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'alcohol', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="Adulteration"
                                            type="number"
                                            step="0.01"
                                            value={line.adulteration ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'adulteration', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            aria-label="Seal Number"
                                            type="number"
                                            step="0.01"
                                            value={line.sealNo ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'sealNo', e.target.value)}
                                            style={cellInputStyle}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        {idx > 0 && (
                                            <button type="button" onClick={() => removeLine(line.id)}>
                                                Remove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {lines.length < 4 && (
                    <button type="button" onClick={addCompartment} style={{ marginTop: 8 }}>
                        + Add Compartment
                    </button>
                )}

                <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd' }}>
                    <h4>Preview</h4>
                    {lines.map((line, idx) => (
                        <div key={line.id} style={{ marginBottom: 6 }}>
                            Compartment {idx + 1}: {line.compartment} | Milk Type: {
                                milkTypes.find((m) => m.id === line.milkTypeId)?.name || 'N/A'
                            } | KG: {line.kgQty} | LTR: {formatNumber(line.ltr)} | FAT: {line.fat} | CLR: {line.clr} | SNF: {line.snf}
                        </div>
                    ))}
                </div>

                <button type="submit" style={{ marginTop: 12 }}>
                    Save Purchase
                </button>
                {message && <p style={{ color: 'green' }}>{message}</p>}
            </form>
        </div>
    );
};

export default PurchasePage;
