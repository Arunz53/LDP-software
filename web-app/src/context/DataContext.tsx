import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
    MilkType,
    Purchase,
    PurchaseLine,
    StateCode,
    User,
    UserRole,
    VehicleInfo,
    Vendor,
} from '../types';
import { formatNumber } from '../utils/snf';

interface DataContextValue {
    currentUser?: User;
    isAuthenticated: boolean;
    isBootstrapped: boolean;
    userRole?: UserRole;
    setUserRole: (role: UserRole | undefined) => void;
    login: (usernameOrEmail: string, password: string) => Promise<void>;
    logout: () => void;
    vendors: Vendor[];
    addVendor: (vendor: Omit<Vendor, 'id'>) => void;
    milkTypes: MilkType[];
    addMilkType: (milk: Omit<MilkType, 'id'>) => void;
    vehicles: VehicleInfo[];
    addVehicle: (vehicle: Omit<VehicleInfo, 'id'>) => void;
    purchases: Purchase[];
    addPurchase: (purchase: Omit<Purchase, 'id'>) => void;
    updatePurchaseStatus: (id: number, status: Purchase['status']) => void;
    nextVendorCode: () => string;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const seedUsers: User[] = [
    { id: 1, username: 'lab', email: 'lab@ldp.com', password: 'lab123', role: 'lab-report' },
    { id: 2, username: 'data', email: 'data@ldp.com', password: 'data123', role: 'data-entry' },
    { id: 3, username: 'transport', email: 'transport@ldp.com', password: 'transport123', role: 'transport' },
    { id: 4, username: 'accounts', email: 'accounts@ldp.com', password: 'accounts123', role: 'accounts' },
    { id: 5, username: 'admin', email: 'admin@ldp.com', password: 'admin123', role: 'super-admin' },
];

const initialVendors: Vendor[] = [
    {
        id: 1,
        code: 'V001',
        name: 'Sri Lakshmi Vendors',
        state: 'Tamil Nadu',
        city: 'Coimbatore',
        ownerName: 'Anand',
    },
];

const initialMilkTypes: MilkType[] = [
    { id: 1, name: 'RAW CHILLED MILK' },
    { id: 2, name: 'TONED MILK' },
];

const initialVehicles: VehicleInfo[] = [
    {
        id: 1,
        vehicleNumber: 'TN38AB1234',
        driverName: 'Ravi',
        driverMobile: '9876543210',
        transportCompany: 'Lakshmi Logistics',
    },
];

let purchaseCounter = 1;

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
    const [userRole, setUserRole] = useState<UserRole | undefined>();
    const [isBootstrapped, setIsBootstrapped] = useState(false);
    const [vendors, setVendors] = useState<Vendor[]>(() => {
        const stored = localStorage.getItem('ldp_vendors');
        return stored ? JSON.parse(stored) : initialVendors;
    });
    const [milkTypes, setMilkTypes] = useState<MilkType[]>(() => {
        const stored = localStorage.getItem('ldp_milkTypes');
        return stored ? JSON.parse(stored) : initialMilkTypes;
    });
    const [vehicles, setVehicles] = useState<VehicleInfo[]>(() => {
        const stored = localStorage.getItem('ldp_vehicles');
        return stored ? JSON.parse(stored) : initialVehicles;
    });
    const [purchases, setPurchases] = useState<Purchase[]>(() => {
        const stored = localStorage.getItem('ldp_purchases');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        const stored = localStorage.getItem('ldp_session');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as User;
                setCurrentUser(parsed);
                setUserRole(parsed.role);
            } catch (err) {
                // Corrupt session: clear it so the app can continue without crashing
                localStorage.removeItem('ldp_session');
            }
        }
        setIsBootstrapped(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('ldp_vendors', JSON.stringify(vendors));
    }, [vendors]);

    useEffect(() => {
        localStorage.setItem('ldp_milkTypes', JSON.stringify(milkTypes));
    }, [milkTypes]);

    useEffect(() => {
        localStorage.setItem('ldp_vehicles', JSON.stringify(vehicles));
    }, [vehicles]);

    useEffect(() => {
        localStorage.setItem('ldp_purchases', JSON.stringify(purchases));
    }, [purchases]);

    const login = async (usernameOrEmail: string, password: string) => {
        const match = seedUsers.find(
            (u) =>
                (u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
                    u.email?.toLowerCase() === usernameOrEmail.toLowerCase()) &&
                u.password === password
        );
        if (!match) {
            throw new Error('Invalid credentials');
        }
        setCurrentUser(match);
        setUserRole(match.role);
        localStorage.setItem('ldp_session', JSON.stringify(match));
    };

    const logout = () => {
        setCurrentUser(undefined);
        setUserRole(undefined);
        localStorage.removeItem('ldp_session');
    };

    const nextVendorCode = () => {
        const next = vendors.length + 1;
        return `V${String(next).padStart(3, '0')}`;
    };

    const addVendor = (vendor: Omit<Vendor, 'id'>) => {
        setVendors((prev) => [...prev, { ...vendor, id: prev.length + 1 }]);
    };

    const addMilkType = (milk: Omit<MilkType, 'id'>) => {
        setMilkTypes((prev) => [...prev, { ...milk, id: prev.length + 1 }]);
    };

    const addVehicle = (vehicle: Omit<VehicleInfo, 'id'>) => {
        setVehicles((prev) => [...prev, { ...vehicle, id: prev.length + 1 }]);
    };

    const addPurchase = (purchase: Omit<Purchase, 'id'>) => {
        const id = purchaseCounter++;
        setPurchases((prev) => [...prev, { ...purchase, id }]);
    };

    const updatePurchaseStatus = (id: number, status: Purchase['status']) => {
        setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    };

    const value = useMemo(
        () => ({
            currentUser,
            isAuthenticated: !!currentUser,
            isBootstrapped,
            userRole,
            setUserRole,
            login,
            logout,
            vendors,
            addVendor,
            milkTypes,
            addMilkType,
            vehicles,
            addVehicle,
            purchases,
            addPurchase,
            updatePurchaseStatus,
            nextVendorCode,
        }),
        [currentUser, isBootstrapped, userRole, vendors, milkTypes, vehicles, purchases]
    );

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextValue => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within DataProvider');
    return ctx;
};

export const summarizeLiters = (lines: PurchaseLine[]): string => {
    const total = lines.reduce((sum, line) => sum + (line.ltr || 0), 0);
    return formatNumber(total);
};

export const todayIso = (): string => new Date().toISOString().substring(0, 10);

export const stateOptions: StateCode[] = [
    'Tamil Nadu',
    'Kerala',
    'Karnataka',
    'Andhra Pradesh',
    'Telangana',
    'Maharashtra',
];
