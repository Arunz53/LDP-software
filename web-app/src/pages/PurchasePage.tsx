import React, { useMemo, useState } from 'react';
import { useData, summarizeLiters, todayIso } from '../context/DataContext';
import { computeSnf, formatNumber } from '../utils/snf';
import { PurchaseLine, StateCode } from '../types';

const compartmentOptions: PurchaseLine['compartment'][] = ['Front', 'Middle', 'Back', 'Average'];

const cellInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d4d7dc',
    borderRadius: 6,
    boxSizing: 'border-box',
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
    const { vendors, milkTypes, addPurchase, purchases, updatePurchaseStatus } = useData();
    const defaultState: StateCode = vendors[0]?.state || 'Tamil Nadu';
    const [purchaseDate, setPurchaseDate] = useState(todayIso());
    const [state, setState] = useState<StateCode>(defaultState);
    const [vendorId, setVendorId] = useState<number | ''>(vendors[0]?.id ?? '');
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
    };

    const filteredPurchases = useMemo(() => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        return purchases.filter((p) => {
            const dt = new Date(p.date);
            const matchesDate = dt >= from && dt <= to;
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
            return matchesDate && matchesStatus;
        });
    }, [purchases, fromDate, toDate, statusFilter]);

    const totalLiters = filteredPurchases.reduce(
        (sum, p) => sum + p.lines.reduce((lineSum, l) => lineSum + (l.ltr || 0), 0),
        0
    );

    return (
        <div style={{ padding: 16 }}>
            <h2>Purchase Entry</h2>
            <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
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
                        Search Vendor
                        <input
                            aria-label="Search Vendor"
                            placeholder="Search vendor code or name"
                            value={searchVendor}
                            onChange={(e) => setSearchVendor(e.target.value)}
                        />
                    </label>
                    <label>
                        Purchase From*
                        <select
                            aria-label="Purchase From"
                            value={vendorId}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                setVendorId(id);
                                const selected = vendors.find((v) => v.id === id);
                                if (selected) setState(selected.state);
                            }}
                            required
                        >
                            <option value="">Select vendor</option>
                            {filteredVendors.map((v) => (
                                <option key={v.id} value={v.id}>{`${v.code} - ${v.name} (${v.state})`}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Vehicle Number
                        <input
                            aria-label="Vehicle Number"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                        />
                    </label>
                    <label>
                        Driver Name
                        <input
                            aria-label="Driver Name"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                        />
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

                <h3 style={{ marginTop: 16 }}>Milk Details</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 1200, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Compartment</th>
                                <th>Milk Type</th>
                                <th>KG-QTY</th>
                                <th>LTR</th>
                                <th>FAT</th>
                                <th>CLR</th>
                                <th>SNF</th>
                                <th>Temp</th>
                                <th>MBRT</th>
                                <th>Acidity</th>
                                <th>COB</th>
                                <th>Alcohol</th>
                                <th>Adulteration</th>
                                <th>Seal No</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line, idx) => (
                                <tr key={line.id}>
                                    <td>
                                        <select
                                            aria-label="Compartment"
                                            value={line.compartment}
                                            onChange={(e) => handleLineChange(line.id, 'compartment', e.target.value)}
                                        >
                                            {compartmentOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            aria-label="Milk Type"
                                            value={line.milkTypeId}
                                            onChange={(e) => handleLineChange(line.id, 'milkTypeId', e.target.value)}
                                        >
                                            {milkTypes.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            aria-label="KG Qty"
                                            type="number"
                                            step="0.01"
                                            value={line.kgQty}
                                            onChange={(e) => handleLineChange(line.id, 'kgQty', e.target.value)}
                                            style={{ ...cellInputStyle, minWidth: 100 }}
                                        />
                                    </td>
                                    <td>{formatNumber(line.ltr)}</td>
                                    <td>
                                        <input
                                            aria-label="FAT"
                                            type="number"
                                            step="0.01"
                                            value={line.fat}
                                            onChange={(e) => handleLineChange(line.id, 'fat', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            aria-label="CLR"
                                            type="number"
                                            step="0.01"
                                            value={line.clr}
                                            onChange={(e) => handleLineChange(line.id, 'clr', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            aria-label="SNF"
                                            type="number"
                                            step="0.01"
                                            value={line.snf}
                                            disabled
                                            style={{ ...cellInputStyle, background: '#f0f0f0', cursor: 'not-allowed' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            aria-label="Temperature"
                                            type="number"
                                            step="0.01"
                                            value={line.temperature ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'temperature', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            aria-label="MBRT"
                                            type="number"
                                            step="0.01"
                                            value={line.mbrt ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'mbrt', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            aria-label="Acidity"
                                            type="number"
                                            step="0.01"
                                            value={line.acidity ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'acidity', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            aria-label="COB"
                                            type="number"
                                            step="0.01"
                                            value={line.cob ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'cob', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            aria-label="Alcohol"
                                            type="number"
                                            step="0.01"
                                            value={line.alcohol ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'alcohol', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            aria-label="Adulteration"
                                            type="number"
                                            step="0.01"
                                            value={line.adulteration ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'adulteration', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            aria-label="Seal Number"
                                            type="number"
                                            step="0.01"
                                            value={line.sealNo ?? ''}
                                            onChange={(e) => handleLineChange(line.id, 'sealNo', e.target.value)}
                                        />
                                    </td>
                                    <td>
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

            <hr style={{ margin: '24px 0' }} />

            <h3>Purchase List</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <label>
                    From Date
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </label>
                <label>
                    To Date
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </label>
                <label>
                    Status
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                        <option value="All">All</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </label>
            </div>
            <p style={{ marginTop: 8 }}>TOTAL LITER: {formatNumber(totalLiters)}</p>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Invoice Date</th>
                            <th>Invoice No</th>
                            <th>Vendor Name</th>
                            <th>KG</th>
                            <th>Qty (LTR)</th>
                            <th>FAT</th>
                            <th>SNF</th>
                            <th>CLR</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPurchases.map((p) => {
                            const vendor = vendors.find((v) => v.id === p.vendorId);
                            const totalKg = p.lines.reduce((sum, l) => sum + l.kgQty, 0);
                            const totalFat = p.lines[0]?.fat ?? 0;
                            const totalSnf = p.lines[0]?.snf ?? 0;
                            const totalClr = p.lines[0]?.clr ?? 0;
                            return (
                                <tr key={p.id}>
                                    <td>{p.date}</td>
                                    <td>{p.invoiceNo}</td>
                                    <td>{vendor ? `${vendor.name} (${vendor.code})` : ''}</td>
                                    <td>{formatNumber(totalKg)}</td>
                                    <td>{summarizeLiters(p.lines)}</td>
                                    <td>{formatNumber(totalFat)}</td>
                                    <td>{formatNumber(totalSnf)}</td>
                                    <td>{formatNumber(totalClr)}</td>
                                    <td>{p.status}</td>
                                    <td>
                                        {p.status !== 'Accepted' && (
                                            <button
                                                type="button"
                                                onClick={() => updatePurchaseStatus(p.id, 'Accepted')}
                                            >
                                                Accept
                                            </button>
                                        )}
                                        <button type="button" style={{ marginLeft: 6 }}>
                                            Print
                                        </button>
                                        <button type="button" style={{ marginLeft: 6 }}>
                                            Share
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchasePage;
