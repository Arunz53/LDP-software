import React, { useState } from 'react';
import { useData } from '../context/DataContext';

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
];

const MilkTypeForm: React.FC = () => {
    const { addMilkType } = useData();
    const [name, setName] = useState('RAW CHILLED MILK');
    const [hsn, setHsn] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addMilkType({ name, hsnCode: hsn });
        setMessage(`Saved milk type ${name}`);
        setHsn('');
    };

    return (
        <div style={{ maxWidth: 520, margin: '16px auto' }}>
            <h2>Milk Type</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Select milk type*
                    <select value={name} onChange={(e) => setName(e.target.value)}>
                        {milkOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </label>
                <label style={{ display: 'block', marginTop: 8 }}>
                    HSN code
                    <input value={hsn} onChange={(e) => setHsn(e.target.value)} />
                </label>
                <button type="submit" style={{ marginTop: 12 }}>
                    Save Milk Type
                </button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
    );
};

export default MilkTypeForm;
