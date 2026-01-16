import React, { useMemo, useState } from 'react';
import { useData, stateOptions } from '../context/DataContext';
import { Vendor } from '../types';

const emptyForm: Omit<Vendor, 'id' | 'code'> = {
    name: '',
    ownerName: '',
    gstNumber: '',
    mobileNumber: '',
    whatsappNumber: '',
    state: 'Tamil Nadu',
    pinCode: '',
    city: '',
    address: '',
};

const VendorForm: React.FC = () => {
    const { addVendor, vendors, nextVendorCode, updateVendor, softDeleteVendor, restoreVendor } = useData();
    const [form, setForm] = useState<Omit<Vendor, 'id' | 'code'>>({ ...emptyForm });
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showRecycleBin, setShowRecycleBin] = useState(false);
    const [editingVendorId, setEditingVendorId] = useState<number | null>(null);

    const latestCode = useMemo(() => nextVendorCode(), [vendors.length]);

    const activeVendors = useMemo(() => vendors.filter((v) => !v.isDeleted), [vendors]);
    const deletedVendors = useMemo(() => vendors.filter((v) => v.isDeleted), [vendors]);

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.state || !form.city) {
            setMessage('Vendor name, state, and city are required');
            return;
        }

        if (editingVendorId !== null) {
            // Update existing vendor - find the existing vendor to preserve the code
            const existingVendor = vendors.find((v) => v.id === editingVendorId);
            if (existingVendor) {
                updateVendor(editingVendorId, { ...form, code: existingVendor.code });
                setMessage(`Updated vendor ${form.name}`);
            }
            setEditingVendorId(null);
        } else {
            // Add new vendor
            addVendor({ ...form, code: latestCode });
            setMessage(`Saved vendor ${form.name} with code ${latestCode}`);
        }

        setForm({ ...emptyForm, state: form.state });
        setShowForm(false);
    };

    const handleEdit = (vendor: Vendor) => {
        const { id, code, isDeleted, ...rest } = vendor;
        setForm(rest);
        setEditingVendorId(id);
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this vendor? It will be moved to Recycle Bin.')) {
            softDeleteVendor(id);
            setMessage('Vendor moved to Recycle Bin');
        }
    };

    const handleRestore = (id: number) => {
        restoreVendor(id);
        setMessage('Vendor restored from Recycle Bin');
    };

    const buttonStyle: React.CSSProperties = {
        padding: '6px 12px',
        marginRight: '6px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600',
    };

    const editButtonStyle: React.CSSProperties = { ...buttonStyle, background: '#3b82f6', color: 'white' };
    const deleteButtonStyle: React.CSSProperties = { ...buttonStyle, background: '#ef4444', color: 'white' };
    const restoreButtonStyle: React.CSSProperties = { ...buttonStyle, background: '#10b981', color: 'white' };

    if (showForm) {
        return (
            <div style={{ maxWidth: 720, margin: '16px auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>{editingVendorId !== null ? 'Edit Vendor' : 'Vendor Creation'}</h2>
                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setMessage('');
                            setEditingVendorId(null);
                            setForm({ ...emptyForm });
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
                {editingVendorId === null && <p>Vendor code auto: {latestCode}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        <label>
                            Vendor Name*
                            <input
                                aria-label="Vendor Name"
                                value={form.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Owner Name
                            <input
                                aria-label="Owner Name"
                                value={form.ownerName}
                                onChange={(e) => handleChange('ownerName', e.target.value)}
                            />
                        </label>
                        <label>
                            GST Number
                            <input
                                aria-label="GST Number"
                                value={form.gstNumber}
                                onChange={(e) => handleChange('gstNumber', e.target.value)}
                            />
                        </label>
                        <label>
                            Mobile Number
                            <input
                                aria-label="Mobile Number"
                                value={form.mobileNumber}
                                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                            />
                        </label>
                        <label>
                            WhatsApp Number
                            <input
                                aria-label="WhatsApp Number"
                                value={form.whatsappNumber}
                                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                            />
                        </label>
                        <label>
                            State*
                            <select
                                aria-label="State"
                                value={form.state}
                                onChange={(e) => handleChange('state', e.target.value)}
                                required
                            >
                                {stateOptions.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Pin Code
                            <input
                                aria-label="Pin Code"
                                value={form.pinCode}
                                onChange={(e) => handleChange('pinCode', e.target.value)}
                            />
                        </label>
                        <label>
                            City*
                            <input
                                aria-label="City"
                                value={form.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <label>
                            Address
                            <textarea
                                aria-label="Address"
                                value={form.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                rows={2}
                            />
                        </label>
                    </div>
                    <button type="submit" style={{ marginTop: 12 }}>
                        {editingVendorId !== null ? 'Update Vendor' : 'Save Vendor'}
                    </button>
                </form>
                {message && <p style={{ color: 'green' }}>{message}</p>}
            </div>
        );
    }

    if (showRecycleBin) {
        return (
            <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Recycle Bin</h2>
                    <button
                        onClick={() => setShowRecycleBin(false)}
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
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Vendor Name</th>
                                <th>Owner Name</th>
                                <th>Mobile</th>
                                <th>State</th>
                                <th>City</th>
                                <th>GST Number</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deletedVendors.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: 20 }}>
                                        Recycle Bin is empty
                                    </td>
                                </tr>
                            ) : (
                                deletedVendors.map((vendor) => (
                                    <tr key={vendor.id} style={{ opacity: 0.6 }}>
                                        <td>{vendor.code}</td>
                                        <td>{vendor.name}</td>
                                        <td>{vendor.ownerName}</td>
                                        <td>{vendor.mobileNumber}</td>
                                        <td>{vendor.state}</td>
                                        <td>{vendor.city}</td>
                                        <td>{vendor.gstNumber}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleRestore(vendor.id)}
                                                style={restoreButtonStyle}
                                            >
                                                Restore
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {message && <p style={{ color: 'green', marginTop: 16 }}>{message}</p>}
            </div>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Vendors List</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    {deletedVendors.length > 0 && (
                        <button
                            onClick={() => setShowRecycleBin(true)}
                            style={{
                                padding: '10px 20px',
                                background: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            🗑️ Recycle Bin ({deletedVendors.length})
                        </button>
                    )}
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
                        + Vendor Creation Entry
                    </button>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Vendor Name</th>
                            <th>Owner Name</th>
                            <th>Mobile</th>
                            <th>State</th>
                            <th>City</th>
                            <th>GST Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeVendors.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: 20 }}>
                                    No vendors found. Click "Vendor Creation Entry" to add one.
                                </td>
                            </tr>
                        ) : (
                            activeVendors.map((vendor) => (
                                <tr key={vendor.id}>
                                    <td>{vendor.code}</td>
                                    <td>{vendor.name}</td>
                                    <td>{vendor.ownerName}</td>
                                    <td>{vendor.mobileNumber}</td>
                                    <td>{vendor.state}</td>
                                    <td>{vendor.city}</td>
                                    <td>{vendor.gstNumber}</td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(vendor)}
                                            style={editButtonStyle}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(vendor.id)}
                                            style={deleteButtonStyle}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {message && <p style={{ color: 'green', marginTop: 16 }}>{message}</p>}
        </div>
    );
};

export default VendorForm;
