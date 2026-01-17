// API Configuration
const API_BASE_URL = 'http://localhost:8080/LDP%20software/LDP-Software/backend/api';

// API Client with credentials
const apiClient = {
    async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE_URL}/${endpoint}`;
        const config: RequestInit = {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    put(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete(endpoint: string) {
        return this.request(endpoint, { method: 'DELETE' });
    },
};

// Authentication API
export const authAPI = {
    login(username: string, password: string, role: string) {
        return apiClient.post('auth.php?action=login', { username, password, role });
    },

    logout() {
        return apiClient.post('auth.php?action=logout', {});
    },

    getCurrentUser() {
        return apiClient.get('auth.php?action=me');
    },
};

// Vendors API
export const vendorsAPI = {
    getAll() {
        return apiClient.get('vendors.php');
    },

    create(vendor: any) {
        return apiClient.post('vendors.php', vendor);
    },

    update(id: number, vendor: any) {
        return apiClient.put('vendors.php', { id, ...vendor });
    },

    delete(id: number) {
        return apiClient.delete(`vendors.php?id=${id}`);
    },
};

// Milk Types API
export const milkTypesAPI = {
    getAll() {
        return apiClient.get('milktypes.php');
    },

    create(milkType: any) {
        return apiClient.post('milktypes.php', milkType);
    },

    update(id: number, milkType: any) {
        return apiClient.put('milktypes.php', { id, ...milkType });
    },

    delete(id: number) {
        return apiClient.delete(`milktypes.php?id=${id}`);
    },
};

// Purchases API
export const purchasesAPI = {
    getAll() {
        return apiClient.get('purchases.php');
    },

    create(purchase: any) {
        return apiClient.post('purchases.php', purchase);
    },

    updateStatus(id: number, status: string) {
        return apiClient.put('purchases.php', { id, status });
    },

    delete(id: number) {
        return apiClient.delete(`purchases.php?id=${id}`);
    },
};

// Sales API
export const salesAPI = {
    getAll() {
        return apiClient.get('sales.php');
    },

    create(sale: any) {
        return apiClient.post('sales.php', sale);
    },

    updateStatus(id: number, status: string) {
        return apiClient.put('sales.php', { id, status });
    },

    delete(id: number) {
        return apiClient.delete(`sales.php?id=${id}`);
    },
};

// Vehicles API
export const vehiclesAPI = {
    getVehicleNumbers() {
        return apiClient.get('vehicles.php/vehicle-numbers');
    },

    getDrivers() {
        return apiClient.get('vehicles.php/drivers');
    },

    getCapacities() {
        return apiClient.get('vehicles.php/vehicle-capacities');
    },

    getTransportCompanies() {
        return apiClient.get('vehicles.php/transport-companies');
    },

    getVehicleMasters() {
        return apiClient.get('vehicles.php/vehicle-masters');
    },

    createVehicleNumber(data: any) {
        return apiClient.post('vehicles.php/vehicle-numbers', data);
    },

    createDriver(data: any) {
        return apiClient.post('vehicles.php/drivers', data);
    },

    createCapacity(data: any) {
        return apiClient.post('vehicles.php/vehicle-capacities', data);
    },

    createTransportCompany(data: any) {
        return apiClient.post('vehicles.php/transport-companies', data);
    },

    createVehicleMaster(data: any) {
        return apiClient.post('vehicles.php/vehicle-masters', data);
    },

    updateVehicleNumber(id: number, data: any) {
        return apiClient.put('vehicles.php/vehicle-numbers', { ...data, id });
    },

    updateDriver(id: number, data: any) {
        return apiClient.put('vehicles.php/drivers', { ...data, id });
    },

    updateCapacity(id: number, data: any) {
        return apiClient.put('vehicles.php/vehicle-capacities', { ...data, id });
    },

    updateTransportCompany(id: number, data: any) {
        return apiClient.put('vehicles.php/transport-companies', { ...data, id });
    },

    updateVehicleMaster(id: number, data: any) {
        return apiClient.put('vehicles.php/vehicle-masters', { ...data, id });
    },

    deleteVehicleNumber(id: number) {
        return apiClient.delete(`vehicles.php/vehicle-numbers?id=${id}`);
    },

    deleteDriver(id: number) {
        return apiClient.delete(`vehicles.php/drivers?id=${id}`);
    },

    deleteCapacity(id: number) {
        return apiClient.delete(`vehicles.php/vehicle-capacities?id=${id}`);
    },

    deleteTransportCompany(id: number) {
        return apiClient.delete(`vehicles.php/transport-companies?id=${id}`);
    },

    deleteVehicleMaster(id: number) {
        return apiClient.delete(`vehicles.php/vehicle-masters?id=${id}`);
    },
};

// Recycle Bin API
export const recycleBinAPI = {
    getAll(type?: 'purchases' | 'sales' | 'all') {
        const typeParam = type ? `?type=${type}` : '';
        return apiClient.get(`recyclebin.php${typeParam}`);
    },

    restore(id: number, type: 'purchase' | 'sale') {
        return apiClient.post('recyclebin.php', { id, type });
    },

    permanentDelete(id: number, type: 'purchase' | 'sale') {
        return apiClient.delete(`recyclebin.php?id=${id}&type=${type}`);
    },
};
