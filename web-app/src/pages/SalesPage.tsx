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

const SalesPage: React.FC = () => {
    const { vendors, milkTypes, addSales, sales, updateSalesStatus, deleteSales, vehicles, vehicleMasters, getVehicleInfo, vehicleNumbers, drivers, currentUser, userRole } = useData();
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
    const [vendorSearchFilter, setVendorSearchFilter] = useState('');

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
                // Sales calculation: Liter = KG / (1.0 + CLR/1000)
                if (key === 'kgQty' || key === 'clr') {
                    const kgQty = key === 'kgQty' ? Number(value) : updated.kgQty;
                    const clr = key === 'clr' ? Number(value) : updated.clr;
                    if (kgQty > 0 && clr > 0) {
                        const density = 1.0 + (clr / 1000);
                        updated.ltr = Number((kgQty / density).toFixed(2));
                    } else {
                        updated.ltr = 0;
                    }
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!purchaseDate || !state || !vendorId || lines.length === 0) {
            setMessage('Fill date, state, customer, and at least one compartment');
            return;
        }
        const invoiceNo = `SALES-${Date.now()}`;
        try {
            await addSales({
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
            setMessage(`Saved sales ${invoiceNo}`);
            setShowForm(false);
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
        } catch (error) {
            console.error('Failed to save sales:', error);
            setMessage('Failed to save sales');
        }
    };

    const filteredSales = useMemo(() => {
        let result = [...sales];
        
        // Apply date filtering only if isFiltered is true
        if (isFiltered && fromDate && toDate) {
            result = result.filter((p) => {
                // Compare date strings directly (YYYY-MM-DD format)
                return p.date >= fromDate && p.date <= toDate;
            });
        }
        
        // Apply vendor search filter
        if (vendorSearchFilter.trim()) {
            result = result.filter((p) => {
                const vendor = vendors.find((v) => v.id === p.vendorId);
                const vendorName = vendor?.name || '';
                const vendorCode = vendor?.code || '';
                const searchTerm = vendorSearchFilter.toLowerCase();
                return vendorName.toLowerCase().includes(searchTerm) || 
                       vendorCode.toLowerCase().includes(searchTerm);
            });
        }
        
        // Sort newest first (tie-break by id desc)
        return result.sort((a, b) => {
            const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (diff !== 0) return diff;
            return (b.id || 0) - (a.id || 0);
        });
    }, [sales, isFiltered, fromDate, toDate, vendorSearchFilter, vendors]);

    const totalLiters = filteredSales.reduce(
        (sum, p) => sum + p.lines.reduce((lineSum, l) => lineSum + (l.ltr || 0), 0),
        0
    );

    const handleSearch = () => {
        setIsFiltered(true);
    };

    const handleAccept = (id: number) => {
        updateSalesStatus(id, 'Accepted');
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this sale? It will be moved to the Recycle Bin.')) {
            try {
                await deleteSales(id);
                setMessage('Sale moved to Recycle Bin successfully');
                setTimeout(() => setMessage(''), 3000);
            } catch (error) {
                console.error('Failed to delete sale:', error);
                setMessage('Failed to delete sale');
            }
        }
    };

    if (!showForm) {
        return (
            <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Sales List</h2>
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
                        + Sales Entry
                    </button>
                </div>
                
                <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Recent Sales</h3>
                <p style={{ marginBottom: 8, fontWeight: 600 }}>TOTAL LITER: {formatNumber(totalLiters)}</p>
                
                {/* Filter Section */}
                <div style={{ 
                    marginTop: 16, 
                    marginBottom: 16, 
                    padding: 16, 
                    background: '#ffffff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 8 
                }}>
                    <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Filter Options</h4>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', minWidth: 150 }}>
                            <span style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#64748b' }}>Search Vendor</span>
                            <input
                                type="text"
                                value={vendorSearchFilter}
                                onChange={(e) => setVendorSearchFilter(e.target.value)}
                                placeholder="Search by name or code..."
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #d4d7dc',
                                    borderRadius: 6,
                                    fontSize: 13,
                                    height: 38,
                                }}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', minWidth: 150 }}>
                            <span style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#64748b' }}>From Date</span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #d4d7dc',
                                    borderRadius: 6,
                                    fontSize: 13,
                                }}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', minWidth: 150 }}>
                            <span style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#64748b' }}>To Date</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #d4d7dc',
                                    borderRadius: 6,
                                    fontSize: 13,
                                }}
                            />
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                            <span style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#64748b' }}>Status</span>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', height: 38 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="purchaseStatus"
                                        value="Delivered"
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: 13, color: '#475569' }}>Delivered</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="purchaseStatus"
                                        value="Accepted"
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: 13, color: '#475569' }}>Accepted</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="purchaseStatus"
                                        value="Rejected"
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: 13, color: '#475569' }}>Rejected</span>
                                </label>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsFiltered(true);
                            }}
                            style={{
                                padding: '8px 20px',
                                background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                height: 38,
                            }}
                        >
                            Apply Filter
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsFiltered(false);
                                setFromDate(todayIso());
                                setToDate(todayIso());
                                setVendorSearchFilter('');
                            }}
                            style={{
                                padding: '8px 20px',
                                background: '#64748b',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                height: 38,
                            }}
                        >
                            Clear Filter
                        </button>
                        {(isFiltered || vendorSearchFilter.trim()) && (
                            <span style={{ 
                                padding: '8px 12px', 
                                background: '#dbeafe', 
                                color: '#1e40af', 
                                borderRadius: 6, 
                                fontSize: 12,
                                fontWeight: 500,
                                height: 38,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                Filter Active
                            </span>
                        )}
                    </div>
                </div>
                
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
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                                        No sales yet
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((p, index) => {
                                    const vendor = vendors.find((v) => v.id === p.vendorId);
                                    const totalKg = p.lines.reduce((sum, l) => sum + l.kgQty, 0);
                                    const totalLtr = p.lines.reduce((sum, l) => sum + l.ltr, 0);
                                    const avgFat = p.lines.length > 0 ? p.lines.reduce((sum, l) => sum + l.fat, 0) / p.lines.length : 0;
                                    const avgSnf = p.lines.length > 0 ? p.lines.reduce((sum, l) => sum + l.snf, 0) / p.lines.length : 0;
                                    const avgClr = p.lines.length > 0 ? p.lines.reduce((sum, l) => sum + l.clr, 0) / p.lines.length : 0;
                                    const formattedDate = new Date(p.date).toLocaleDateString('en-GB');
                                    return (
                                        <tr key={`${p.id}-${p.invoiceNo}-${index}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#475569' }}>{formattedDate}</td>
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
                                                {userRole === 'data-entry' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAccept(p.id)}
                                                        style={{ marginRight: 6, padding: '4px 8px', fontSize: 12, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    style={{ marginRight: 6, padding: '4px 8px', fontSize: 12, background: '#64748b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                >
                                                    Print
                                                </button>
                                                <button
                                                    type="button"
                                                    style={{ marginRight: 6, padding: '4px 8px', fontSize: 12, background: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                >
                                                    Share
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(p.id)}
                                                    style={{ padding: '4px 8px', fontSize: 12, background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                >
                                                    Delete
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
                <h2>Sales Entry</h2>
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
                        Sales Date*
                        <input
                            aria-label="Sales date"
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Sales To city
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
                            label="Sales To (Customer) *"
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
                            placeholder="Search customer..."
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
                            + Add New Customer
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
                                            required
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
                                            required
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
                                            required
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
                                            required
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
                    Save Sales
                </button>
                {message && <p style={{ color: 'green' }}>{message}</p>}
            </form>
        </div>
    );
};

export default SalesPage;
