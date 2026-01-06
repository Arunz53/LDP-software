import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import SearchableDropdown from '../components/SearchableDropdown';
import {
    Driver,
    TransportCompany,
    Vehicle,
    VehicleCapacity,
    VehicleNumber,
} from '../types';

type TabType = 'vehicles' | 'vehicleNumbers' | 'drivers' | 'capacities' | 'companies';

const VehicleMasterPage: React.FC = () => {
    const {
        vehicleNumbers,
        addVehicleNumber,
        updateVehicleNumber,
        deleteVehicleNumber,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        vehicleCapacities,
        addVehicleCapacity,
        updateVehicleCapacity,
        deleteVehicleCapacity,
        transportCompanies,
        addTransportCompany,
        updateTransportCompany,
        deleteTransportCompany,
        vehicleMasters,
        addVehicleMaster,
        updateVehicleMaster,
        deleteVehicleMaster,
        getVehicleInfo,
    } = useData();

    const [activeTab, setActiveTab] = useState<TabType>('vehicles');

    const tabs = [
        { id: 'vehicles' as TabType, label: 'Vehicle List', icon: '🚛' },
        { id: 'vehicleNumbers' as TabType, label: 'Vehicle Numbers', icon: '🔢' },
        { id: 'drivers' as TabType, label: 'Drivers', icon: '👤' },
        { id: 'capacities' as TabType, label: 'Capacities', icon: '📦' },
        { id: 'companies' as TabType, label: 'Transport Companies', icon: '🏢' },
    ];

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ marginBottom: 24 }}>Vehicle Master Management</h2>

            {/* Tabs */}
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    borderBottom: '2px solid #e5e7eb',
                    marginBottom: 24,
                    overflowX: 'auto',
                }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px',
                            background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                            color: activeTab === tab.id ? '#1d4ed8' : '#64748b',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid #1d4ed8' : 'none',
                            marginBottom: -2,
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: 'none',
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'vehicles' && <VehicleListTab />}
            {activeTab === 'vehicleNumbers' && <VehicleNumberTab />}
            {activeTab === 'drivers' && <DriverTab />}
            {activeTab === 'capacities' && <CapacityTab />}
            {activeTab === 'companies' && <TransportCompanyTab />}
        </div>
    );
};

// Vehicle List Tab
const VehicleListTab: React.FC = () => {
    const {
        vehicleMasters,
        vehicleNumbers,
        drivers,
        vehicleCapacities,
        transportCompanies,
        addVehicleMaster,
        updateVehicleMaster,
        deleteVehicleMaster,
        getVehicleInfo,
    } = useData();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<Vehicle, 'id'>>({
        vehicleNumberId: 0,
        driverId: 0,
        capacityId: 0,
        transportCompanyId: 0,
    });
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.vehicleNumberId || !form.driverId || !form.capacityId || !form.transportCompanyId) {
            setMessage('All fields are required');
            return;
        }

        if (editingId) {
            updateVehicleMaster(editingId, form);
            setMessage('Vehicle updated successfully');
        } else {
            addVehicleMaster(form);
            setMessage('Vehicle added successfully');
        }

        resetForm();
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingId(vehicle.id);
        setForm({
            vehicleNumberId: vehicle.vehicleNumberId,
            driverId: vehicle.driverId,
            capacityId: vehicle.capacityId,
            transportCompanyId: vehicle.transportCompanyId,
        });
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            deleteVehicleMaster(id);
            setMessage('Vehicle deleted successfully');
        }
    };

    const resetForm = () => {
        setForm({
            vehicleNumberId: 0,
            driverId: 0,
            capacityId: 0,
            transportCompanyId: 0,
        });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredVehicles = vehicleMasters.filter((vehicle) => {
        const info = getVehicleInfo(vehicle.id);
        if (!info) return false;
        return (
            info.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            info.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            info.transportCompany?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (showForm) {
        return (
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setMessage('');
                        }}
                        style={{
                            padding: '8px 16px',
                            background: '#64748b',
                        }}
                    >
                        ← Back to List
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: 16 }}>
                        <SearchableDropdown
                            label="Vehicle Number *"
                            options={vehicleNumbers.map((vn) => ({ id: vn.id, label: vn.number }))}
                            value={form.vehicleNumberId}
                            onChange={(id: number) => setForm({ ...form, vehicleNumberId: id })}
                            placeholder="Select Vehicle Number"
                        />

                        <SearchableDropdown
                            label="Driver *"
                            options={drivers.map((d) => ({ id: d.id, label: `${d.name} - ${d.mobile}` }))}
                            value={form.driverId}
                            onChange={(id: number) => setForm({ ...form, driverId: id })}
                            placeholder="Select Driver"
                        />

                        <SearchableDropdown
                            label="Vehicle Capacity *"
                            options={vehicleCapacities.map((vc) => ({ id: vc.id, label: vc.capacity }))}
                            value={form.capacityId}
                            onChange={(id: number) => setForm({ ...form, capacityId: id })}
                            placeholder="Select Capacity"
                        />

                        <SearchableDropdown
                            label="Transport Company *"
                            options={transportCompanies.map((tc) => ({ id: tc.id, label: tc.name }))}
                            value={form.transportCompanyId}
                            onChange={(id: number) => setForm({ ...form, transportCompanyId: id })}
                            placeholder="Select Transport Company"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                        <button type="submit" style={{ flex: 1 }}>
                            {editingId ? 'Update Vehicle' : 'Save Vehicle'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            style={{ flex: 1, background: '#94a3b8' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {message && (
                    <p style={{ marginTop: 16, color: message.includes('success') ? 'green' : 'red', fontWeight: 600 }}>
                        {message}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search vehicles..."
                    style={{ flex: 1, maxWidth: 400 }}
                />
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: '10px 20px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    + Add Vehicle
                </button>
            </div>

            {message && (
                <div style={{ padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 8, marginBottom: 16 }}>
                    {message}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fbff', borderBottom: '2px solid #d6e1f5' }}>
                            <th style={{ padding: 12, textAlign: 'left' }}>Vehicle Number</th>
                            <th style={{ padding: 12, textAlign: 'left' }}>Driver Name</th>
                            <th style={{ padding: 12, textAlign: 'left' }}>Driver Mobile</th>
                            <th style={{ padding: 12, textAlign: 'left' }}>Vehicle Capacity</th>
                            <th style={{ padding: 12, textAlign: 'left' }}>Transport Company</th>
                            <th style={{ padding: 12, textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehicles.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                    {searchTerm ? 'No vehicles found matching your search' : 'No vehicles found. Click "Add Vehicle" to create one.'}
                                </td>
                            </tr>
                        ) : (
                            filteredVehicles.map((vehicle) => {
                                const info = getVehicleInfo(vehicle.id);
                                if (!info) return null;
                                return (
                                    <tr key={vehicle.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: 12 }}>{info.vehicleNumber}</td>
                                        <td style={{ padding: 12 }}>{info.driverName}</td>
                                        <td style={{ padding: 12 }}>{info.driverMobile}</td>
                                        <td style={{ padding: 12 }}>{info.capacity}</td>
                                        <td style={{ padding: 12 }}>{info.transportCompany}</td>
                                        <td style={{ padding: 12, textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleEdit(vehicle)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#0ea5e9',
                                                    fontSize: 12,
                                                    marginRight: 8,
                                                }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vehicle.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#ef4444',
                                                    fontSize: 12,
                                                }}
                                            >
                                                🗑️ Delete
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
};

// Vehicle Number Master Tab
const VehicleNumberTab: React.FC = () => {
    const { vehicleNumbers, addVehicleNumber, updateVehicleNumber, deleteVehicleNumber } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<VehicleNumber, 'id'>>({ number: '' });
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.number.trim()) {
            setMessage('Vehicle number is required');
            return;
        }

        if (editingId) {
            updateVehicleNumber(editingId, form);
            setMessage('Vehicle number updated successfully');
        } else {
            addVehicleNumber(form);
            setMessage('Vehicle number added successfully');
        }

        resetForm();
    };

    const handleEdit = (vehicleNumber: VehicleNumber) => {
        setEditingId(vehicleNumber.id);
        setForm({ number: vehicleNumber.number });
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this vehicle number?')) {
            deleteVehicleNumber(id);
            setMessage('Vehicle number deleted successfully');
        }
    };

    const resetForm = () => {
        setForm({ number: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredItems = vehicleNumbers.filter((vn) =>
        vn.number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showForm) {
        return (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>{editingId ? 'Edit Vehicle Number' : 'Add Vehicle Number'}</h3>
                    <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: '#64748b' }}>
                        ← Back
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label>
                        Vehicle Number *
                        <input
                            value={form.number}
                            onChange={(e) => setForm({ number: e.target.value })}
                            placeholder="e.g., TN38AB1234"
                            required
                        />
                    </label>

                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button type="submit" style={{ flex: 1 }}>
                            {editingId ? 'Update' : 'Save'}
                        </button>
                        <button type="button" onClick={resetForm} style={{ flex: 1, background: '#94a3b8' }}>
                            Cancel
                        </button>
                    </div>
                </form>

                {message && <p style={{ marginTop: 16, color: 'green', fontWeight: 600 }}>{message}</p>}
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search vehicle numbers..."
                    style={{ flex: 1, maxWidth: 400 }}
                />
                <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px' }}>
                    + Add Vehicle Number
                </button>
            </div>

            {message && (
                <div style={{ padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 8, marginBottom: 16 }}>
                    {message}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fbff', borderBottom: '2px solid #d6e1f5' }}>
                            <th style={{ padding: 12, textAlign: 'left', width: '60%' }}>Vehicle Number</th>
                            <th style={{ padding: 12, textAlign: 'center', width: '40%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={2} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                    {searchTerm ? 'No results found' : 'No vehicle numbers found'}
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((vn) => (
                                <tr key={vn.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: 12 }}>{vn.number}</td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(vn)}
                                            style={{ padding: '6px 12px', background: '#0ea5e9', fontSize: 12, marginRight: 8 }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vn.id)}
                                            style={{ padding: '6px 12px', background: '#ef4444', fontSize: 12 }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Driver Master Tab
const DriverTab: React.FC = () => {
    const { drivers, addDriver, updateDriver, deleteDriver } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<Driver, 'id'>>({ name: '', mobile: '' });
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.mobile.trim()) {
            setMessage('All fields are required');
            return;
        }

        if (editingId) {
            updateDriver(editingId, form);
            setMessage('Driver updated successfully');
        } else {
            addDriver(form);
            setMessage('Driver added successfully');
        }

        resetForm();
    };

    const handleEdit = (driver: Driver) => {
        setEditingId(driver.id);
        setForm({ name: driver.name, mobile: driver.mobile });
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this driver?')) {
            deleteDriver(id);
            setMessage('Driver deleted successfully');
        }
    };

    const resetForm = () => {
        setForm({ name: '', mobile: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredItems = drivers.filter(
        (d) =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.mobile.includes(searchTerm)
    );

    if (showForm) {
        return (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>{editingId ? 'Edit Driver' : 'Add Driver'}</h3>
                    <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: '#64748b' }}>
                        ← Back
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <label>
                            Driver Name *
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Enter driver name"
                                required
                            />
                        </label>

                        <label>
                            Mobile Number *
                            <input
                                value={form.mobile}
                                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                placeholder="Enter mobile number"
                                required
                            />
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button type="submit" style={{ flex: 1 }}>
                            {editingId ? 'Update' : 'Save'}
                        </button>
                        <button type="button" onClick={resetForm} style={{ flex: 1, background: '#94a3b8' }}>
                            Cancel
                        </button>
                    </div>
                </form>

                {message && <p style={{ marginTop: 16, color: 'green', fontWeight: 600 }}>{message}</p>}
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search drivers..."
                    style={{ flex: 1, maxWidth: 400 }}
                />
                <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px' }}>
                    + Add Driver
                </button>
            </div>

            {message && (
                <div style={{ padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 8, marginBottom: 16 }}>
                    {message}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fbff', borderBottom: '2px solid #d6e1f5' }}>
                            <th style={{ padding: 12, textAlign: 'left', width: '40%' }}>Driver Name</th>
                            <th style={{ padding: 12, textAlign: 'left', width: '30%' }}>Mobile Number</th>
                            <th style={{ padding: 12, textAlign: 'center', width: '30%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                    {searchTerm ? 'No results found' : 'No drivers found'}
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((driver) => (
                                <tr key={driver.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: 12 }}>{driver.name}</td>
                                    <td style={{ padding: 12 }}>{driver.mobile}</td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(driver)}
                                            style={{ padding: '6px 12px', background: '#0ea5e9', fontSize: 12, marginRight: 8 }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(driver.id)}
                                            style={{ padding: '6px 12px', background: '#ef4444', fontSize: 12 }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Capacity Master Tab
const CapacityTab: React.FC = () => {
    const { vehicleCapacities, addVehicleCapacity, updateVehicleCapacity, deleteVehicleCapacity } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<VehicleCapacity, 'id'>>({ capacity: '' });
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.capacity.trim()) {
            setMessage('Capacity is required');
            return;
        }

        if (editingId) {
            updateVehicleCapacity(editingId, form);
            setMessage('Capacity updated successfully');
        } else {
            addVehicleCapacity(form);
            setMessage('Capacity added successfully');
        }

        resetForm();
    };

    const handleEdit = (capacity: VehicleCapacity) => {
        setEditingId(capacity.id);
        setForm({ capacity: capacity.capacity });
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this capacity?')) {
            deleteVehicleCapacity(id);
            setMessage('Capacity deleted successfully');
        }
    };

    const resetForm = () => {
        setForm({ capacity: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredItems = vehicleCapacities.filter((vc) =>
        vc.capacity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showForm) {
        return (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>{editingId ? 'Edit Capacity' : 'Add Capacity'}</h3>
                    <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: '#64748b' }}>
                        ← Back
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label>
                        Vehicle Capacity *
                        <input
                            value={form.capacity}
                            onChange={(e) => setForm({ capacity: e.target.value })}
                            placeholder="e.g., 5000 Liters"
                            required
                        />
                    </label>

                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button type="submit" style={{ flex: 1 }}>
                            {editingId ? 'Update' : 'Save'}
                        </button>
                        <button type="button" onClick={resetForm} style={{ flex: 1, background: '#94a3b8' }}>
                            Cancel
                        </button>
                    </div>
                </form>

                {message && <p style={{ marginTop: 16, color: 'green', fontWeight: 600 }}>{message}</p>}
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search capacities..."
                    style={{ flex: 1, maxWidth: 400 }}
                />
                <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px' }}>
                    + Add Capacity
                </button>
            </div>

            {message && (
                <div style={{ padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 8, marginBottom: 16 }}>
                    {message}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fbff', borderBottom: '2px solid #d6e1f5' }}>
                            <th style={{ padding: 12, textAlign: 'left', width: '60%' }}>Capacity</th>
                            <th style={{ padding: 12, textAlign: 'center', width: '40%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={2} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                    {searchTerm ? 'No results found' : 'No capacities found'}
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((vc) => (
                                <tr key={vc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: 12 }}>{vc.capacity}</td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(vc)}
                                            style={{ padding: '6px 12px', background: '#0ea5e9', fontSize: 12, marginRight: 8 }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vc.id)}
                                            style={{ padding: '6px 12px', background: '#ef4444', fontSize: 12 }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Transport Company Master Tab
const TransportCompanyTab: React.FC = () => {
    const { transportCompanies, addTransportCompany, updateTransportCompany, deleteTransportCompany } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<TransportCompany, 'id'>>({ name: '' });
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setMessage('Company name is required');
            return;
        }

        if (editingId) {
            updateTransportCompany(editingId, form);
            setMessage('Transport company updated successfully');
        } else {
            addTransportCompany(form);
            setMessage('Transport company added successfully');
        }

        resetForm();
    };

    const handleEdit = (company: TransportCompany) => {
        setEditingId(company.id);
        setForm({ name: company.name });
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this transport company?')) {
            deleteTransportCompany(id);
            setMessage('Transport company deleted successfully');
        }
    };

    const resetForm = () => {
        setForm({ name: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredItems = transportCompanies.filter((tc) =>
        tc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showForm) {
        return (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>{editingId ? 'Edit Transport Company' : 'Add Transport Company'}</h3>
                    <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: '#64748b' }}>
                        ← Back
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label>
                        Company Name *
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ name: e.target.value })}
                            placeholder="Enter company name"
                            required
                        />
                    </label>

                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button type="submit" style={{ flex: 1 }}>
                            {editingId ? 'Update' : 'Save'}
                        </button>
                        <button type="button" onClick={resetForm} style={{ flex: 1, background: '#94a3b8' }}>
                            Cancel
                        </button>
                    </div>
                </form>

                {message && <p style={{ marginTop: 16, color: 'green', fontWeight: 600 }}>{message}</p>}
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search companies..."
                    style={{ flex: 1, maxWidth: 400 }}
                />
                <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px' }}>
                    + Add Company
                </button>
            </div>

            {message && (
                <div style={{ padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 8, marginBottom: 16 }}>
                    {message}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fbff', borderBottom: '2px solid #d6e1f5' }}>
                            <th style={{ padding: 12, textAlign: 'left', width: '60%' }}>Company Name</th>
                            <th style={{ padding: 12, textAlign: 'center', width: '40%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={2} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                    {searchTerm ? 'No results found' : 'No transport companies found'}
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((tc) => (
                                <tr key={tc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: 12 }}>{tc.name}</td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(tc)}
                                            style={{ padding: '6px 12px', background: '#0ea5e9', fontSize: 12, marginRight: 8 }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tc.id)}
                                            style={{ padding: '6px 12px', background: '#ef4444', fontSize: 12 }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VehicleMasterPage;
