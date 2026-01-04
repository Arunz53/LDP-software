import React, { useState } from 'react';

const DataEntryForm: React.FC = () => {
    const [milkType, setMilkType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [vendor, setVendor] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle data submission logic here
        console.log({ milkType, quantity, vendor, date });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="milkType">Milk Type:</label>
                <input
                    type="text"
                    id="milkType"
                    value={milkType}
                    onChange={(e) => setMilkType(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="quantity">Quantity (liters):</label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="vendor">Vendor:</label>
                <input
                    type="text"
                    id="vendor"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="date">Date:</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default DataEntryForm;