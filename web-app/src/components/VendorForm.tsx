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
    const { addVendor, vendors, nextVendorCode } = useData();
    const [form, setForm] = useState<Omit<Vendor, 'id' | 'code'>>({ ...emptyForm });
    const [message, setMessage] = useState('');

    const latestCode = useMemo(() => nextVendorCode(), [vendors.length]);

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.state || !form.city) {
            setMessage('Vendor name, state, and city are required');
            return;
        }
        addVendor({ ...form, code: latestCode });
        setMessage(`Saved vendor ${form.name} with code ${latestCode}`);
        setForm({ ...emptyForm, state: form.state });
    };

    return (
        <div style={{ maxWidth: 720, margin: '16px auto' }}>
            <h2>Vendor Creation</h2>
            <p>Vendor code auto: {latestCode}</p>
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
                    Save Vendor
                </button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
    );
};

export default VendorForm;
