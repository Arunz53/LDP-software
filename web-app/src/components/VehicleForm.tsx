import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { VehicleInfo } from '../types';

const emptyVehicle: Omit<VehicleInfo, 'id'> = {
    vehicleNumber: '',
    driverName: '',
    capacity: '',
    driverMobile: '',
    transportCompany: '',
};

const VehicleForm: React.FC = () => {
    const { addVehicle } = useData();
    const [form, setForm] = useState<Omit<VehicleInfo, 'id'>>(emptyVehicle);
    const [message, setMessage] = useState('');

    const handleChange = (key: keyof Omit<VehicleInfo, 'id'>, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.vehicleNumber || !form.driverName) {
            setMessage('Vehicle number and driver name are required');
            return;
        }
        addVehicle(form);
        setMessage(`Saved vehicle ${form.vehicleNumber}`);
        setForm(emptyVehicle);
    };

    return (
        <div style={{ maxWidth: 640, margin: '16px auto' }}>
            <h2>Vehicle Info Creation</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    <label>
                        Vehicle number*
                        <input
                            aria-label="Vehicle number"
                            value={form.vehicleNumber}
                            onChange={(e) => handleChange('vehicleNumber', e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Driver name*
                        <input
                            aria-label="Driver name"
                            value={form.driverName}
                            onChange={(e) => handleChange('driverName', e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Vehicle capacity
                        <input
                            aria-label="Vehicle capacity"
                            value={form.capacity}
                            onChange={(e) => handleChange('capacity', e.target.value)}
                        />
                    </label>
                    <label>
                        Driver mobile number
                        <input
                            aria-label="Driver mobile number"
                            value={form.driverMobile}
                            onChange={(e) => handleChange('driverMobile', e.target.value)}
                        />
                    </label>
                    <label>
                        Transport company name
                        <input
                            aria-label="Transport company name"
                            value={form.transportCompany}
                            onChange={(e) => handleChange('transportCompany', e.target.value)}
                        />
                    </label>
                </div>
                <button type="submit" style={{ marginTop: 12 }}>
                    Save Vehicle
                </button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
    );
};

export default VehicleForm;
