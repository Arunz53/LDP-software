import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { MilkType } from '../types';

const milkOptions = [
    'TONED MILK',
    'DOUBLE TONED MILK',
    'STANDARDIZED MILK',
    'FULL CREAM MILK',
    'SKIMMED MILK',
    'RAW CHILLED MILK',
    'MILK CREAM',
    'SMP POWDER',
    'FLAVOURED MILK',
    'GHEE',
    'BUTTER MILK',
    'PANEER',
    'CURD',
    'LASSI',
];

const MilkTypeMasterPage: React.FC = () => {
    const { milkTypes, addMilkType, updateMilkType, deleteMilkType } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<MilkType, 'id'>>({
        name: '',
        hsnCode: '',
    });
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setMessage('Milk type name is required');
            return;
        }

        if (editingId) {
            updateMilkType(editingId, form);
            setMessage('Milk type updated successfully');
        } else {
            addMilkType(form);
            setMessage('Milk type added successfully');
        }

        resetForm();
    };

    const handleEdit = (milkType: MilkType) => {
        setEditingId(milkType.id);
        setForm({ name: milkType.name, hsnCode: milkType.hsnCode });
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this milk type?')) {
            deleteMilkType(id);
            setMessage('Milk type deleted successfully');
        }
    };

    const resetForm = () => {
        setForm({ name: '', hsnCode: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredMilkTypes = milkTypes.filter(
        (mt) =>
            mt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mt.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showForm) {
        return (
            <div style={{ padding: 16 }}>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h2>{editingId ? 'Edit Milk Type' : 'Add Milk Type'}</h2>
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
                            <label>
                                Milk Type Name *
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Enter milk type name"
                                    required
                                />
                            </label>

                            <label>
                                HSN Code
                                <input
                                    type="text"
                                    value={form.hsnCode || ''}
                                    onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                                    placeholder="Enter HSN code (optional)"
                                />
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            <button type="submit" style={{ flex: 1 }}>
                                {editingId ? 'Update Milk Type' : 'Save Milk Type'}
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
            </div>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ marginBottom: 24 }}>Milk Type Master</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search milk types or HSN code..."
                    style={{ flex: 1, maxWidth: 400 }}
                />
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: '10px 20px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    + Add Milk Type
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
                            <th style={{ padding: 12, textAlign: 'left', width: '50%' }}>Milk Type Name</th>
                            <th style={{ padding: 12, textAlign: 'left', width: '30%' }}>HSN Code</th>
                            <th style={{ padding: 12, textAlign: 'center', width: '20%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMilkTypes.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                    {searchTerm
                                        ? 'No milk types found matching your search'
                                        : 'No milk types found. Click "Add Milk Type" to create one.'}
                                </td>
                            </tr>
                        ) : (
                            filteredMilkTypes.map((milkType) => (
                                <tr key={milkType.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: 12, fontWeight: 500 }}>{milkType.name}</td>
                                    <td style={{ padding: 12, color: '#64748b' }}>
                                        {milkType.hsnCode || '-'}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(milkType)}
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
                                            onClick={() => handleDelete(milkType.id)}
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: '#f8fbff', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                    <strong>Total Milk Types:</strong> {filteredMilkTypes.length}
                    {searchTerm && ` (filtered from ${milkTypes.length} total)`}
                </p>
            </div>
        </div>
    );
};

export default MilkTypeMasterPage;
