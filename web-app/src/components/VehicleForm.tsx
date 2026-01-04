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
    const { addVehicle, vehicles } = useData();
    const [form, setForm] = useState<Omit<VehicleInfo, 'id'>>(emptyVehicle);
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);

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
        setShowForm(false);
    };

    if (!showForm) {
        return (
            <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Vehicles List</h2>
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
                        + Vehicle Info Creation
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Vehicle Number</th>
                                <th>Driver Name</th>
                                <th>Driver Mobile</th>
                                <th>Capacity</th>
                                <th>Transport Company</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>
                                        No vehicles found. Click "Vehicle Info Creation" to add one.
                                    </td>
                                </tr>
                            ) : (
                                vehicles.map((vehicle) => (
                                    <tr key={vehicle.id}>
                                        <td>{vehicle.vehicleNumber}</td>
                                        <td>{vehicle.driverName}</td>
                                        <td>{vehicle.driverMobile}</td>
                                        <td>{vehicle.capacity}</td>
                                        <td>{vehicle.transportCompany}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 640, margin: '16px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Vehicle Info Creation</h2>
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
