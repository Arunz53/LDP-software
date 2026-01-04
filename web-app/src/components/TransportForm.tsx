import React, { useState } from 'react';

const TransportForm: React.FC = () => {
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [milkQuantity, setMilkQuantity] = useState('');
    const [destination, setDestination] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log({
            vehicleNumber,
            driverName,
            milkQuantity,
            destination,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="vehicleNumber">Vehicle Number:</label>
                <input
                    type="text"
                    id="vehicleNumber"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="driverName">Driver Name:</label>
                <input
                    type="text"
                    id="driverName"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="milkQuantity">Milk Quantity (liters):</label>
                <input
                    type="number"
                    id="milkQuantity"
                    value={milkQuantity}
                    onChange={(e) => setMilkQuantity(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="destination">Destination:</label>
                <input
                    type="text"
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default TransportForm;