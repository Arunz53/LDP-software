import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import logo from '../Images/logo.jpg';

interface LayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { currentUser, logout } = useData();
    const isLoginPage = location.pathname === '/';

    if (isLoginPage) {
        return <>{children}</>;
    }

    const sidebarLinks = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/vendors', icon: '🏭', label: 'Vendor Master' },
        { path: '/milk-types', icon: '🥛', label: 'Milk Type Master' },
        { path: '/vehicles', icon: '🚛', label: 'Vehicle Master' },
        { path: '/purchase', icon: '📦', label: 'Purchase Entry' },
    ];

    const topNavLinks = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/purchase', label: 'Purchase' },
        { path: '/reports', label: 'Reports' },
        { path: '/accounts', label: 'Accounts' },
        { path: '/transport', label: 'Transport' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fb' }}>
            {/* Sidebar */}
            <div style={{
                width: 260,
                background: '#ffffff',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto'
            }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid #e5e7eb' }}>
                    <img 
                        src={logo} 
                        alt="Lakshmi Dairy" 
                        style={{
                            width: 80,
                            height: 80,
                            objectFit: 'contain',
                            marginBottom: 12
                        }}
                    />
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Lakshmi Dairy</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Management System</div>
                </div>
                
                <div style={{ padding: '16px 12px', flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', padding: '8px 12px', letterSpacing: 0.5 }}>
                        MASTER MENUS
                    </div>
                    {sidebarLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (

                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    borderRadius: 10,
                                    marginBottom: 4,
                                    textDecoration: 'none',
                                    color: isActive ? '#1d4ed8' : '#475569',
                                    background: isActive ? '#eff6ff' : 'transparent',
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: 14
                                }}
                            >
                                <span style={{ fontSize: 18 }}>{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', fontSize: 11, color: '#94a3b8' }}>
                    v1.0 © Lakshmi Dairy
                </div>
            </div>

            {/* Main Content */}
            <div style={{ marginLeft: 260, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top Nav */}
                <div style={{
                    background: '#ffffff',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    height: 64,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', gap: 24, flex: 1 }}>
                        {topNavLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    style={{
                                        padding: '8px 0',
                                        textDecoration: 'none',
                                        color: isActive ? '#1d4ed8' : '#64748b',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: 14,
                                        borderBottom: isActive ? '2px solid #1d4ed8' : 'none'
                                    }}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 13, color: '#475569' }}>
                            Welcome, <strong>{currentUser?.role || 'User'}</strong>
                        </span>
                        <button
                            onClick={logout}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div style={{ padding: 24, flex: 1 }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
