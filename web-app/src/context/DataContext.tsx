import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
    Driver,
    MilkType,
    Purchase,
    PurchaseLine,
    StateCode,
    TransportCompany,
    User,
    UserRole,
    Vehicle,
    VehicleCapacity,
    VehicleInfo,
    VehicleNumber,
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
    updateVendor: (id: number, vendor: Omit<Vendor, 'id'>) => void;
    softDeleteVendor: (id: number) => void;
    restoreVendor: (id: number) => void;
    milkTypes: MilkType[];
    addMilkType: (milk: Omit<MilkType, 'id'>) => void;
    updateMilkType: (id: number, milk: Omit<MilkType, 'id'>) => void;
    deleteMilkType: (id: number) => void;
    vehicles: VehicleInfo[];
    addVehicle: (vehicle: Omit<VehicleInfo, 'id'>) => void;
    purchases: Purchase[];
    addPurchase: (purchase: Omit<Purchase, 'id'>) => void;
    updatePurchaseStatus: (id: number, status: Purchase['status']) => void;
    sales: Purchase[];
    addSales: (sales: Omit<Purchase, 'id'>) => void;
    updateSalesStatus: (id: number, status: Purchase['status']) => void;
    nextVendorCode: () => string;
    // New Master Tables
    vehicleNumbers: VehicleNumber[];
    addVehicleNumber: (vehicleNumber: Omit<VehicleNumber, 'id'>) => void;
    updateVehicleNumber: (id: number, vehicleNumber: Omit<VehicleNumber, 'id'>) => void;
    deleteVehicleNumber: (id: number) => void;
    drivers: Driver[];
    addDriver: (driver: Omit<Driver, 'id'>) => void;
    updateDriver: (id: number, driver: Omit<Driver, 'id'>) => void;
    deleteDriver: (id: number) => void;
    vehicleCapacities: VehicleCapacity[];
    addVehicleCapacity: (capacity: Omit<VehicleCapacity, 'id'>) => void;
    updateVehicleCapacity: (id: number, capacity: Omit<VehicleCapacity, 'id'>) => void;
    deleteVehicleCapacity: (id: number) => void;
    transportCompanies: TransportCompany[];
    addTransportCompany: (company: Omit<TransportCompany, 'id'>) => void;
    updateTransportCompany: (id: number, company: Omit<TransportCompany, 'id'>) => void;
    deleteTransportCompany: (id: number) => void;
    vehicleMasters: Vehicle[];
    addVehicleMaster: (vehicle: Omit<Vehicle, 'id'>) => void;
    updateVehicleMaster: (id: number, vehicle: Omit<Vehicle, 'id'>) => void;
    deleteVehicleMaster: (id: number) => void;
    getVehicleInfo: (vehicleId: number) => VehicleInfo | null;
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

const initialVehicleNumbers: VehicleNumber[] = [
    { id: 1, number: 'TN38AB1234' },
    { id: 2, number: 'TN38CD5678' },
];

const initialDrivers: Driver[] = [
    { id: 1, name: 'Ravi', mobile: '9876543210' },
    { id: 2, name: 'Kumar', mobile: '9876543211' },
];

const initialVehicleCapacities: VehicleCapacity[] = [
    { id: 1, capacity: '5000 Liters' },
    { id: 2, capacity: '7000 Liters' },
    { id: 3, capacity: '10000 Liters' },
];

const initialTransportCompanies: TransportCompany[] = [
    { id: 1, name: 'Lakshmi Logistics' },
    { id: 2, name: 'Sri Transport' },
];

const initialVehicleMasters: Vehicle[] = [
    {
        id: 1,
        vehicleNumberId: 1,
        driverId: 1,
        capacityId: 1,
        transportCompanyId: 1,
    },
];

let purchaseCounter = 1;
let salesCounter = 1;

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
        const parsed: Purchase[] = stored ? JSON.parse(stored) : [];
        const maxId = parsed.reduce((max, p) => (p.id && p.id > max ? p.id : max), 0);
        // Keep the purchase id counter in sync with stored data to avoid id collisions after reloads
        purchaseCounter = Math.max(purchaseCounter, maxId + 1);
        return parsed;
    });

    const [sales, setSales] = useState<Purchase[]>(() => {
        const stored = localStorage.getItem('ldp_sales');
        const parsed: Purchase[] = stored ? JSON.parse(stored) : [];
        const maxId = parsed.reduce((max, p) => (p.id && p.id > max ? p.id : max), 0);
        // Keep the sales id counter in sync with stored data to avoid id collisions after reloads
        salesCounter = Math.max(salesCounter, maxId + 1);
        return parsed;
    });
    
    // New Master Tables State
    const [vehicleNumbers, setVehicleNumbers] = useState<VehicleNumber[]>(() => {
        const stored = localStorage.getItem('ldp_vehicleNumbers');
        return stored ? JSON.parse(stored) : initialVehicleNumbers;
    });
    const [drivers, setDrivers] = useState<Driver[]>(() => {
        const stored = localStorage.getItem('ldp_drivers');
        return stored ? JSON.parse(stored) : initialDrivers;
    });
    const [vehicleCapacities, setVehicleCapacities] = useState<VehicleCapacity[]>(() => {
        const stored = localStorage.getItem('ldp_vehicleCapacities');
        return stored ? JSON.parse(stored) : initialVehicleCapacities;
    });
    const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>(() => {
        const stored = localStorage.getItem('ldp_transportCompanies');
        return stored ? JSON.parse(stored) : initialTransportCompanies;
    });
    const [vehicleMasters, setVehicleMasters] = useState<Vehicle[]>(() => {
        const stored = localStorage.getItem('ldp_vehicleMasters');
        return stored ? JSON.parse(stored) : initialVehicleMasters;
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
        localStorage.setItem('ldp_vehicleNumbers', JSON.stringify(vehicleNumbers));
    }, [vehicleNumbers]);

    useEffect(() => {
        localStorage.setItem('ldp_drivers', JSON.stringify(drivers));
    }, [drivers]);

    useEffect(() => {
        localStorage.setItem('ldp_vehicleCapacities', JSON.stringify(vehicleCapacities));
    }, [vehicleCapacities]);

    useEffect(() => {
        localStorage.setItem('ldp_sales', JSON.stringify(sales));
    }, [sales]);

    useEffect(() => {
        localStorage.setItem('ldp_transportCompanies', JSON.stringify(transportCompanies));
    }, [transportCompanies]);

    useEffect(() => {
        localStorage.setItem('ldp_vehicleMasters', JSON.stringify(vehicleMasters));
    }, [vehicleMasters]);

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
        setVendors((prev) => [...prev, { ...vendor, id: prev.length + 1, isDeleted: false }]);
    };

    const updateVendor = (id: number, vendor: Omit<Vendor, 'id'>) => {
        setVendors((prev) => prev.map((v) => (v.id === id ? { ...vendor, id, isDeleted: v.isDeleted } : v)));
    };

    const softDeleteVendor = (id: number) => {
        setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, isDeleted: true } : v)));
    };

    const restoreVendor = (id: number) => {
        setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, isDeleted: false } : v)));
    };

    const addMilkType = (milk: Omit<MilkType, 'id'>) => {
        setMilkTypes((prev) => [...prev, { ...milk, id: prev.length + 1 }]);
    };

    const updateMilkType = (id: number, milk: Omit<MilkType, 'id'>) => {
        setMilkTypes((prev) => prev.map((m) => (m.id === id ? { ...milk, id } : m)));
    };

    const deleteMilkType = (id: number) => {
        setMilkTypes((prev) => prev.filter((m) => m.id !== id));
    };

    const addSales = (salesData: Omit<Purchase, 'id'>) => {
        const id = salesCounter++;
        setSales((prev) => [...prev, { ...salesData, id }]);
    };

    const updateSalesStatus = (id: number, status: Purchase['status']) => {
        setSales((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    };

    const addPurchase = (purchase: Omit<Purchase, 'id'>) => {
        const id = purchaseCounter++;
        setPurchases((prev) => [...prev, { ...purchase, id }]);
    };

    const updatePurchaseStatus = (id: number, status: Purchase['status']) => {
        setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    };

    const addVehicle = (vehicle: Omit<VehicleInfo, 'id'>) => {
        setVehicles((prev) => [...prev, { ...vehicle, id: prev.length + 1 }]);
    };

    // Vehicle Number Master CRUD
    const addVehicleNumber = (vehicleNumber: Omit<VehicleNumber, 'id'>) => {
        setVehicleNumbers((prev) => [...prev, { ...vehicleNumber, id: prev.length + 1 }]);
    };

    const updateVehicleNumber = (id: number, vehicleNumber: Omit<VehicleNumber, 'id'>) => {
        setVehicleNumbers((prev) => prev.map((vn) => (vn.id === id ? { ...vehicleNumber, id } : vn)));
    };

    const deleteVehicleNumber = (id: number) => {
        setVehicleNumbers((prev) => prev.filter((vn) => vn.id !== id));
    };

    // Driver Master CRUD
    const addDriver = (driver: Omit<Driver, 'id'>) => {
        setDrivers((prev) => [...prev, { ...driver, id: prev.length + 1 }]);
    };

    const updateDriver = (id: number, driver: Omit<Driver, 'id'>) => {
        setDrivers((prev) => prev.map((d) => (d.id === id ? { ...driver, id } : d)));
    };

    const deleteDriver = (id: number) => {
        setDrivers((prev) => prev.filter((d) => d.id !== id));
    };

    // Vehicle Capacity Master CRUD
    const addVehicleCapacity = (capacity: Omit<VehicleCapacity, 'id'>) => {
        setVehicleCapacities((prev) => [...prev, { ...capacity, id: prev.length + 1 }]);
    };

    const updateVehicleCapacity = (id: number, capacity: Omit<VehicleCapacity, 'id'>) => {
        setVehicleCapacities((prev) => prev.map((vc) => (vc.id === id ? { ...capacity, id } : vc)));
    };

    const deleteVehicleCapacity = (id: number) => {
        setVehicleCapacities((prev) => prev.filter((vc) => vc.id !== id));
    };

    // Transport Company Master CRUD
    const addTransportCompany = (company: Omit<TransportCompany, 'id'>) => {
        setTransportCompanies((prev) => [...prev, { ...company, id: prev.length + 1 }]);
    };

    const updateTransportCompany = (id: number, company: Omit<TransportCompany, 'id'>) => {
        setTransportCompanies((prev) => prev.map((tc) => (tc.id === id ? { ...company, id } : tc)));
    };

    const deleteTransportCompany = (id: number) => {
        setTransportCompanies((prev) => prev.filter((tc) => tc.id !== id));
    };

    // Vehicle Master CRUD
    const addVehicleMaster = (vehicle: Omit<Vehicle, 'id'>) => {
        setVehicleMasters((prev) => [...prev, { ...vehicle, id: prev.length + 1 }]);
    };

    const updateVehicleMaster = (id: number, vehicle: Omit<Vehicle, 'id'>) => {
        setVehicleMasters((prev) => prev.map((v) => (v.id === id ? { ...vehicle, id } : v)));
    };

    const deleteVehicleMaster = (id: number) => {
        setVehicleMasters((prev) => prev.filter((v) => v.id !== id));
    };

    // Helper function to get complete vehicle info
    const getVehicleInfo = (vehicleId: number): VehicleInfo | null => {
        const vehicle = vehicleMasters.find((v) => v.id === vehicleId);
        if (!vehicle) return null;

        const vehicleNumber = vehicleNumbers.find((vn) => vn.id === vehicle.vehicleNumberId);
        const driver = drivers.find((d) => d.id === vehicle.driverId);
        const capacity = vehicleCapacities.find((vc) => vc.id === vehicle.capacityId);
        const transportCompany = transportCompanies.find((tc) => tc.id === vehicle.transportCompanyId);

        return {
            id: vehicle.id,
            vehicleNumber: vehicleNumber?.number || '',
            driverName: driver?.name || '',
            driverMobile: driver?.mobile,
            capacity: capacity?.capacity,
            transportCompany: transportCompany?.name,
        };
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
            updateVendor,
            softDeleteVendor,
            restoreVendor,
            milkTypes,
            addMilkType,
            updateMilkType,
            deleteMilkType,
            vehicles,
            addVehicle,
            purchases,
            addPurchase,
            updatePurchaseStatus,
            sales,
            addSales,
            updateSalesStatus,
            nextVendorCode,
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
        }),
        [currentUser, isBootstrapped, userRole, vendors, milkTypes, vehicles, purchases, sales,
         vehicleNumbers, drivers, vehicleCapacities, transportCompanies, vehicleMasters]
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
