import React, { useState } from 'react';

const AccountsForm: React.FC = () => {
    const [accountName, setAccountName] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const [accountType, setAccountType] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Handle form submission logic here
        console.log('Account Name:', accountName);
        console.log('Account Balance:', accountBalance);
        console.log('Account Type:', accountType);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="accountName">Account Name:</label>
                <input
                    type="text"
                    id="accountName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="accountBalance">Account Balance:</label>
                <input
                    type="number"
                    id="accountBalance"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(Number(e.target.value))}
                    required
                />
            </div>
            <div>
                <label htmlFor="accountType">Account Type:</label>
                <select
                    id="accountType"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    required
                >
                    <option value="">Select Account Type</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="fixed">Fixed</option>
                </select>
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default AccountsForm;