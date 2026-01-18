import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';

const LoginForm: React.FC = () => {
    const history = useHistory();
    const { login } = useData();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('lab-report');
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!username || !password) {
            setError('Username and password are required');
            return;
        }
        if (!role) {
            setError('Please select a role');
            return;
        }
        try {
            await login(username, password, role);
            setError('');
            history.push('/dashboard');
        } catch (e) {
            setError('Invalid username/email, password, or role mismatch');
        }
    };

    const cardStyle: React.CSSProperties = {
        maxWidth: 420,
        margin: '80px auto',
        padding: 32,
        borderRadius: 18,
        background: '#ffffff',
        color: '#0f172a',
        boxShadow: '0 30px 80px rgba(14, 116, 195, 0.18)',
        border: '1px solid #d6e1f5',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid #d6e1f5',
        background: '#f8fbff',
        color: '#0f172a',
        outline: 'none',
        boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.06)',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: 6,
        color: '#475569',
        fontSize: 13,
        letterSpacing: 0.3,
    };

    const buttonStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: 12,
        background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9)',
        border: 'none',
        color: '#f8fafc',
        fontWeight: 700,
        letterSpacing: 0.5,
        cursor: 'pointer',
        boxShadow: '0 14px 28px rgba(14, 165, 233, 0.3)',
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            width: '100%',
            padding: '24px 12px', 
            background: 'linear-gradient(rgba(24, 66, 146, 0.65), rgba(24, 66, 146, 0.65)), url("https://images.unsplash.com/photo-1500622944204-b135684e99fd?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat',
            backgroundAttachment: 'fixed',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'auto'
        }}>
            <div style={cardStyle}>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, letterSpacing: 1, color: '#2563eb' }}>LAKSHMI DAIRY</div>
                    <h2 style={{ margin: '4px 0 0', fontWeight: 800, letterSpacing: 0.5 }}>Login</h2>
                    <p style={{ margin: '6px 0 0', color: '#475569', fontSize: 13 }}>
                        Sign in to continue to LDP Softwares
                    </p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
                    <div>
                        <label htmlFor="username" style={labelStyle}>
                            Username or Email
                        </label>
                        <input
                            style={inputStyle}
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" style={labelStyle}>
                            Password
                        </label>
                        <input
                            style={inputStyle}
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="role" style={labelStyle}>
                            Role
                        </label>
                        <select
                            style={{ ...inputStyle, appearance: 'none' }}
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                        >
                            <option value="lab-report">Lab Report</option>
                            <option value="data-entry">Data Entry</option>
                            <option value="transport">Transport</option>
                            <option value="accounts">Accounts</option>
                            <option value="super-admin">Super Admin</option>
                        </select>
                    </div>
                    {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}
                    <button type="submit" style={buttonStyle}>
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;