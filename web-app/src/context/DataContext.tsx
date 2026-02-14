import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    Driver,
    MilkType,
    Purchase,
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
import { authAPI, vendorsAPI, milkTypesAPI, purchasesAPI, salesAPI, vehiclesAPI } from '../services/api';

interface DataContextValue {
    // Transport Reports
    transportReports: any[];
    refreshTransportReports: () => Promise<void>;
    currentUser?: User;
    isAuthenticated: boolean;
    isBootstrapped: boolean;
    isLoading: boolean;
    userRole?: UserRole;
    setUserRole: (role: UserRole | undefined) => void;
    login: (usernameOrEmail: string, password: string, selectedRole: UserRole) => Promise<void>;
    logout: () => void;
    vendors: Vendor[];
    addVendor: (vendor: Omit<Vendor, 'id'>) => Promise<void>;
    updateVendor: (id: number, vendor: Omit<Vendor, 'id'>) => Promise<void>;
    softDeleteVendor: (id: number) => Promise<void>;
    restoreVendor: (id: number) => void;
    milkTypes: MilkType[];
    addMilkType: (milk: Omit<MilkType, 'id'>) => Promise<void>;
    updateMilkType: (id: number, milk: Omit<MilkType, 'id'>) => Promise<void>;
    deleteMilkType: (id: number) => Promise<void>;
    vehicles: VehicleInfo[];
    addVehicle: (vehicle: Omit<VehicleInfo, 'id'>) => void;
    purchases: Purchase[];
    addPurchase: (purchase: Omit<Purchase, 'id'>) => Promise<void>;
    updatePurchaseStatus: (id: number, statusOrObj: Purchase['status'] | { status: Purchase['status'], kmCharges1?: number, kmCharges3?: number, tollGateCharges?: number }) => Promise<void>;
    deletePurchase: (id: number) => Promise<void>;
    sales: Purchase[];
    addSales: (sales: Omit<Purchase, 'id'>) => Promise<void>;
    updateSalesStatus: (id: number, statusOrObj: Purchase['status'] | { status: Purchase['status'], kmCharges1?: number, kmCharges3?: number, tollGateCharges?: number }) => Promise<void>;
    deleteSales: (id: number) => Promise<void>;
    nextVendorCode: () => string;
    refreshData: () => Promise<void>;
    vehicleNumbers: VehicleNumber[];
    addVehicleNumber: (vehicleNumber: Omit<VehicleNumber, 'id'>) => Promise<void>;
    updateVehicleNumber: (id: number, vehicleNumber: Omit<VehicleNumber, 'id'>) => void;
    deleteVehicleNumber: (id: number) => void;
    drivers: Driver[];
    addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>;
    updateDriver: (id: number, driver: Omit<Driver, 'id'>) => void;
    deleteDriver: (id: number) => void;
    vehicleCapacities: VehicleCapacity[];
    addVehicleCapacity: (capacity: Omit<VehicleCapacity, 'id'>) => Promise<void>;
    updateVehicleCapacity: (id: number, capacity: Omit<VehicleCapacity, 'id'>) => void;
    deleteVehicleCapacity: (id: number) => void;
    transportCompanies: TransportCompany[];
    addTransportCompany: (company: Omit<TransportCompany, 'id'>) => Promise<void>;
    updateTransportCompany: (id: number, company: Omit<TransportCompany, 'id'>) => void;
    deleteTransportCompany: (id: number) => void;
    vehicleMasters: Vehicle[];
    addVehicleMaster: (vehicle: Omit<Vehicle, 'id'>) => void;
    updateVehicleMaster: (id: number, vehicle: Omit<Vehicle, 'id'>) => void;
    deleteVehicleMaster: (id: number) => void;
    getVehicleInfo: (vehicleId: number) => VehicleInfo | null;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const stateOptions: StateCode[] = [
    'Tamil Nadu',
    'Kerala',
    'Karnataka',
    'Andhra Pradesh',
    'Telangana',
    'Maharashtra'
];

export const todayIso = () => new Date().toISOString().split('T')[0];

export const summarizeLiters = (purchases: Purchase[]): { [milkTypeId: number]: number } => {
    const result: { [milkTypeId: number]: number } = {};
    purchases.forEach((p) => {
        p.lines.forEach((line) => {
            result[line.milkTypeId] = (result[line.milkTypeId] || 0) + parseFloat(String(line.ltr)) || 0;
        });
    });
    return result;
};

// Normalize purchase data: convert string numeric fields to numbers
const normalizePurchase = (purchase: any): Purchase => {
    // Support both purchases and sales (for transport report)
    return {
        ...purchase,
        kmCharges1: purchase.kmCharges1 !== undefined ? Number(purchase.kmCharges1) : (purchase.km_charges1 !== undefined ? Number(purchase.km_charges1) : 0),
        kmCharges3: purchase.kmCharges3 !== undefined ? Number(purchase.kmCharges3) : (purchase.km_charges3 !== undefined ? Number(purchase.km_charges3) : 0),
        tollGateCharges: purchase.tollGateCharges !== undefined ? Number(purchase.tollGateCharges) : (purchase.toll_gate_charges !== undefined ? Number(purchase.toll_gate_charges) : 0),
        lines: purchase.lines ? purchase.lines.map((line: any) => ({
            ...line,
            milkTypeId: Number(line.milkTypeId) || 0,
            kgQty: parseFloat(String(line.kgQty)) || 0,
            ltr: parseFloat(String(line.ltr)) || 0,
            fat: parseFloat(String(line.fat)) || 0,
            clr: parseFloat(String(line.clr)) || 0,
            snf: parseFloat(String(line.snf)) || 0,
            temperature: line.temperature ? parseFloat(String(line.temperature)) : undefined,
            mbrt: line.mbrt ? parseFloat(String(line.mbrt)) : undefined,
            acidity: line.acidity ? parseFloat(String(line.acidity)) : undefined,
            cob: line.cob ? parseFloat(String(line.cob)) : undefined,
            alcohol: line.alcohol ? parseFloat(String(line.alcohol)) : undefined,
            adulteration: line.adulteration ? parseFloat(String(line.adulteration)) : undefined,
            sealNo: line.sealNo ? Number(line.sealNo) : undefined,
        })) : [],
    };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
    const [userRole, setUserRole] = useState<UserRole | undefined>();
    const [isBootstrapped, setIsBootstrapped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Data states
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [milkTypes, setMilkTypes] = useState<MilkType[]>([]);
    const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [sales, setSales] = useState<Purchase[]>([]);
    const [vehicleNumbers, setVehicleNumbers] = useState<VehicleNumber[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicleCapacities, setVehicleCapacities] = useState<VehicleCapacity[]>([]);
    const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([]);
    const [vehicleMasters, setVehicleMasters] = useState<Vehicle[]>([]);
    // Transport Reports state
    const [transportReports, setTransportReports] = useState<any[]>([]);
    // Load transport reports (only for transport users)
    const refreshTransportReports = async () => {
        setTransportReports([]);
    };
    // Load transport reports when userRole is transport
    useEffect(() => {
        if (userRole === 'transport') {
            refreshTransportReports();
        }
    }, [userRole]);

    // Load all data from API
    const loadData = async () => {
        try {
            setIsLoading(true);
            const [vendorsData, milkTypesData, purchasesData, salesData, vehicleNumbersData, driversData, capacitiesData, companiesData, vehicleMastersData] = await Promise.all([
                vendorsAPI.getAll().catch(() => []),
                milkTypesAPI.getAll().catch(() => []),
                purchasesAPI.getAll().catch(() => []),
                salesAPI.getAll().catch(() => []),
                vehiclesAPI.getVehicleNumbers().catch(() => []),
                vehiclesAPI.getDrivers().catch(() => []),
                vehiclesAPI.getCapacities().catch(() => []),
                vehiclesAPI.getTransportCompanies().catch(() => []),
                vehiclesAPI.getVehicleMasters().catch(() => [])
            ]);

            setVendors(vendorsData);
            setMilkTypes(milkTypesData);
            setPurchases(purchasesData.map(normalizePurchase));
            setSales(salesData.map(normalizePurchase));
            setVehicleNumbers(vehicleNumbersData);
            setDrivers(driversData);
            setVehicleCapacities(capacitiesData);
            setTransportCompanies(companiesData);
            setVehicleMasters(vehicleMastersData);

            // Always populate vehicles with VehicleInfo including transportCompany
            const vehiclesInfo: VehicleInfo[] = vehicleMastersData.map((master: any) => {
                // If backend provided joined data, use it directly
                if (master.vehicle_number) {
                    return {
                        id: master.id,
                        vehicleNumber: master.vehicle_number,
                        driverName: master.driver_name || '',
                        driverMobile: master.driver_mobile || '',
                        capacity: master.capacity || '',
                        transportCompany: master.transport_company || '',
                    };
                }
                // Fallback to manual lookup
                const vehicleNumber = vehicleNumbersData.find((vn: any) => vn.id === master.vehicleNumberId);
                const driver = driversData.find((d: any) => d.id === master.driverId);
                const capacity = capacitiesData.find((vc: any) => vc.id === master.capacityId);
                const company = companiesData.find((tc: any) => tc.id === master.transportCompanyId);
                return {
                    id: master.id,
                    vehicleNumber: vehicleNumber?.number || '',
                    driverName: driver?.name || '',
                    driverMobile: driver?.mobile || '',
                    capacity: capacity?.capacity || '',
                    transportCompany: company?.name || '',
                };
            });
            setVehicles(vehiclesInfo);

            console.log('✅ Data loaded from API:', { 
                vendors: vendorsData.length, 
                purchases: purchasesData.length, 
                sales: salesData.length,
                vehicleNumbers: vehicleNumbersData.length,
                vehicleMasters: vehicleMastersData.length,
                vehicles: vehiclesInfo.length
            });
            if (purchasesData.length > 0) {
                console.log('📦 Sample purchase data:', purchasesData[0]);
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Check for existing session and load data
    useEffect(() => {
        const initializeApp = async () => {
            try {
                const user = await authAPI.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    setUserRole(user.role);
                    await loadData();
                }
            } catch (error) {
                console.log('No active session');
            } finally {
                setIsBootstrapped(true);
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    const login = async (usernameOrEmail: string, password: string, selectedRole: UserRole) => {
        try {
            const user = await authAPI.login(usernameOrEmail, password, selectedRole);
            setCurrentUser(user);
            setUserRole(user.role);
            await loadData();
        } catch (error) {
            throw new Error('Invalid credentials or role mismatch');
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setCurrentUser(undefined);
            setUserRole(undefined);
            setVendors([]);
            setMilkTypes([]);
            setPurchases([]);
            setSales([]);
        }
    };

    const refreshData = async () => {
        await loadData();
    };

    const nextVendorCode = () => {
        const next = vendors.length + 1;
        return `V${String(next).padStart(3, '0')}`;
    };

    // Vendors
    const addVendor = async (vendor: Omit<Vendor, 'id'>) => {
        const newVendor = await vendorsAPI.create(vendor);
        setVendors((prev) => [...prev, newVendor]);
    };

    const updateVendor = async (id: number, vendor: Omit<Vendor, 'id'>) => {
        const updated = await vendorsAPI.update(id, vendor);
        setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)));
    };

    const softDeleteVendor = async (id: number) => {
        await vendorsAPI.delete(id);
        setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, isDeleted: true } : v)));
    };

    const restoreVendor = (id: number) => {
        setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, isDeleted: false } : v)));
    };

    // Milk Types
    const addMilkType = async (milk: Omit<MilkType, 'id'>) => {
        const newMilkType = await milkTypesAPI.create(milk);
        setMilkTypes((prev) => [...prev, newMilkType]);
    };

    const updateMilkType = async (id: number, milk: Omit<MilkType, 'id'>) => {
        const updated = await milkTypesAPI.update(id, milk);
        setMilkTypes((prev) => prev.map((m) => (m.id === id ? updated : m)));
    };

    const deleteMilkType = async (id: number) => {
        await milkTypesAPI.delete(id);
        setMilkTypes((prev) => prev.filter((m) => m.id !== id));
    };

    // Purchases
    const addPurchase = async (purchase: Omit<Purchase, 'id'>) => {
        console.log('🔄 Saving purchase to API...', purchase);
        try {
            const purchaseWithUser = {
                ...purchase,
                createdBy: currentUser?.id
            };
            const newPurchase = await purchasesAPI.create(purchaseWithUser);
            console.log('✅ Purchase saved successfully:', newPurchase);
            setPurchases((prev) => {
                const updated = [...prev, normalizePurchase(newPurchase)];
                console.log('📊 Updated purchases state:', updated.length);
                return updated;
            });
        } catch (error) {
            console.error('❌ Failed to save purchase:', error);
            throw error;
        }
    };

    // Accepts either status string or object with billing fields
    const updatePurchaseStatus = async (id: number, statusOrObj: Purchase['status'] | { status: Purchase['status'], kmCharges1?: number, kmCharges3?: number, tollGateCharges?: number }) => {
        let updateObj: any;
        if (typeof statusOrObj === 'string') {
            updateObj = { id, status: statusOrObj };
        } else {
            updateObj = { id, ...statusOrObj };
        }
        await purchasesAPI.updateStatus(id, updateObj);
        setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, ...updateObj } : p)));
    };

    const deletePurchase = async (id: number) => {
        await purchasesAPI.delete(id);
        setPurchases((prev) => prev.filter((p) => p.id !== id));
    };

    // Sales
    const addSales = async (salesData: Omit<Purchase, 'id'>) => {
        const salesWithUser = {
            ...salesData,
            createdBy: currentUser?.id
        };
        const newSale = await salesAPI.create(salesWithUser);
        setSales((prev) => [...prev, normalizePurchase(newSale)]);
    };

    // Accepts either status string or object with billing fields
    const updateSalesStatus = async (id: number, statusOrObj: Purchase['status'] | { status: Purchase['status'], kmCharges1?: number, kmCharges3?: number, tollGateCharges?: number }) => {
        let updateObj: any;
        if (typeof statusOrObj === 'string') {
            updateObj = { id, status: statusOrObj };
        } else {
            updateObj = { id, ...statusOrObj };
        }
        await salesAPI.updateStatus(id, updateObj);
        setSales((prev) => prev.map((p) => (p.id === id ? { ...p, ...updateObj } : p)));
    };

    const deleteSales = async (id: number) => {
        await salesAPI.delete(id);
        setSales((prev) => prev.filter((p) => p.id !== id));
    };

    // Vehicle Numbers
    const addVehicleNumber = async (vehicleNumber: Omit<VehicleNumber, 'id'>) => {
        const newVehicleNumber = await vehiclesAPI.createVehicleNumber(vehicleNumber);
        setVehicleNumbers((prev) => [...prev, newVehicleNumber]);
    };

    const updateVehicleNumber = async (id: number, vehicleNumber: Omit<VehicleNumber, 'id'>) => {
        await vehiclesAPI.updateVehicleNumber(id, vehicleNumber);
        setVehicleNumbers((prev) => prev.map((vn) => (vn.id === id ? { ...vehicleNumber, id } : vn)));
    };

    const deleteVehicleNumber = async (id: number) => {
        await vehiclesAPI.deleteVehicleNumber(id);
        setVehicleNumbers((prev) => prev.filter((vn) => vn.id !== id));
    };

    // Drivers
    const addDriver = async (driver: Omit<Driver, 'id'>) => {
        const newDriver = await vehiclesAPI.createDriver(driver);
        setDrivers((prev) => [...prev, newDriver]);
    };

    const updateDriver = async (id: number, driver: Omit<Driver, 'id'>) => {
        await vehiclesAPI.updateDriver(id, driver);
        setDrivers((prev) => prev.map((d) => (d.id === id ? { ...driver, id } : d)));
    };

    const deleteDriver = async (id: number) => {
        await vehiclesAPI.deleteDriver(id);
        setDrivers((prev) => prev.filter((d) => d.id !== id));
    };

    // Vehicle Capacities
    const addVehicleCapacity = async (capacity: Omit<VehicleCapacity, 'id'>) => {
        const newCapacity = await vehiclesAPI.createCapacity(capacity);
        setVehicleCapacities((prev) => [...prev, newCapacity]);
    };

    const updateVehicleCapacity = async (id: number, capacity: Omit<VehicleCapacity, 'id'>) => {
        await vehiclesAPI.updateCapacity(id, capacity);
        setVehicleCapacities((prev) => prev.map((vc) => (vc.id === id ? { ...capacity, id } : vc)));
    };

    const deleteVehicleCapacity = async (id: number) => {
        await vehiclesAPI.deleteCapacity(id);
        setVehicleCapacities((prev) => prev.filter((vc) => vc.id !== id));
    };

    // Transport Companies
    const addTransportCompany = async (company: Omit<TransportCompany, 'id'>) => {
        const newCompany = await vehiclesAPI.createTransportCompany(company);
        setTransportCompanies((prev) => [...prev, newCompany]);
    };

    const updateTransportCompany = async (id: number, company: Omit<TransportCompany, 'id'>) => {
        await vehiclesAPI.updateTransportCompany(id, company);
        setTransportCompanies((prev) => prev.map((tc) => (tc.id === id ? { ...company, id } : tc)));
    };

    const deleteTransportCompany = async (id: number) => {
        await vehiclesAPI.deleteTransportCompany(id);
        setTransportCompanies((prev) => prev.filter((tc) => tc.id !== id));
    };

    // Vehicle Masters
    const addVehicleMaster = async (vehicle: Omit<Vehicle, 'id'>) => {
        const newVehicle = await vehiclesAPI.createVehicleMaster(vehicle);
        // Transform response
        const transformed = {
            id: newVehicle.id,
            vehicleNumberId: vehicle.vehicleNumberId,
            driverId: vehicle.driverId,
            capacityId: vehicle.capacityId,
            transportCompanyId: vehicle.transportCompanyId
        };
        setVehicleMasters((prev) => [...prev, transformed]);
        await loadData(); // Reload to get joined data
    };

    const updateVehicleMaster = async (id: number, vehicle: Omit<Vehicle, 'id'>) => {
        await vehiclesAPI.updateVehicleMaster(id, vehicle);
        await loadData(); // Reload to get updated joined data
    };

    const deleteVehicleMaster = async (id: number) => {
        await vehiclesAPI.deleteVehicleMaster(id);
        setVehicleMasters((prev) => prev.filter((v) => v.id !== id));
    };

    const getVehicleInfo = (vehicleId: number): VehicleInfo | null => {
        const master = vehicleMasters.find((vm) => vm.id === vehicleId);
        if (!master) return null;

        // If backend provided joined data, use it directly
        if (master.vehicle_number) {
            return {
                id: master.id,
                vehicleNumber: master.vehicle_number,
                driverName: master.driver_name || '',
                driverMobile: master.driver_mobile || '',
                capacity: master.capacity || '',
                transportCompany: master.transport_company || '',
            };
        }

        // Fallback to manual lookup
        const vehicleNumber = vehicleNumbers.find((vn) => vn.id === master.vehicleNumberId);
        const driver = drivers.find((d) => d.id === master.driverId);
        const capacity = vehicleCapacities.find((vc) => vc.id === master.capacityId);
        const company = transportCompanies.find((tc) => tc.id === master.transportCompanyId);

        return {
            id: master.id,
            vehicleNumber: vehicleNumber?.number || '',
            driverName: driver?.name || '',
            driverMobile: driver?.mobile || '',
            capacity: capacity?.capacity || '',
            transportCompany: company?.name || '',
        };
    };

    const addVehicle = (vehicle: Omit<VehicleInfo, 'id'>) => {
        setVehicles((prev) => [...prev, { ...vehicle, id: prev.length + 1 }]);
    };

    const value: DataContextValue = {
            transportReports,
            refreshTransportReports,
        currentUser,
        isAuthenticated: !!currentUser,
        isBootstrapped,
        isLoading,
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
        deletePurchase,
        sales,
        addSales,
        updateSalesStatus,
        deleteSales,
        nextVendorCode,
        refreshData,
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
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

export default DataContext;
