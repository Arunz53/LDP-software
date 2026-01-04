import React, { useState } from 'react';

const LabReportForm: React.FC = () => {
    const [vendor, setVendor] = useState('');
    const [milkType, setMilkType] = useState('');
    const [vehicleInfo, setVehicleInfo] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log({ vendor, milkType, vehicleInfo });
    };

    return (
        <form onSubmit={handleSubmit}>
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
                <label htmlFor="vehicleInfo">Vehicle Info:</label>
                <input
                    type="text"
                    id="vehicleInfo"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default LabReportForm;