// Production API Configuration
const API_BASE_URL = 'https://yourdomain.com/api'; // TODO: Replace with your actual domain

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

    async get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async put(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(endpoint: string) {
        return this.request(endpoint, { method: 'DELETE' });
    },
};

// Auth API
export const authAPI = {
    login: (username: string, password: string) =>
        apiClient.post('auth.php', { action: 'login', username, password }),
    
    logout: () =>
        apiClient.post('auth.php', { action: 'logout' }),
    
    checkSession: () =>
        apiClient.get('auth.php?action=check'),
};

// Vendors API
export const vendorsAPI = {
    getAll: () => apiClient.get('vendors.php'),
    create: (vendor: any) => apiClient.post('vendors.php', vendor),
    update: (vendor: any) => apiClient.put('vendors.php', vendor),
    delete: (id: number) => apiClient.delete(`vendors.php?id=${id}`),
};

// Vehicles API
export const vehiclesAPI = {
    getAll: () => apiClient.get('vehicles.php'),
    create: (vehicle: any) => apiClient.post('vehicles.php', vehicle),
    update: (vehicle: any) => apiClient.put('vehicles.php', vehicle),
    delete: (id: number) => apiClient.delete(`vehicles.php?id=${id}`),
};

// Milk Types API
export const milkTypesAPI = {
    getAll: () => apiClient.get('milktypes.php'),
    create: (milkType: any) => apiClient.post('milktypes.php', milkType),
    update: (milkType: any) => apiClient.put('milktypes.php', milkType),
    delete: (id: number) => apiClient.delete(`milktypes.php?id=${id}`),
};

// Purchases API
export const purchasesAPI = {
    getAll: () => apiClient.get('purchases.php'),
    create: (purchase: any) => apiClient.post('purchases.php', purchase),
    update: (purchase: any) => apiClient.put('purchases.php', purchase),
    delete: (id: number) => apiClient.delete(`purchases.php?id=${id}`),
};

// Sales API
export const salesAPI = {
    getAll: () => apiClient.get('sales.php'),
    create: (sale: any) => apiClient.post('sales.php', sale),
    update: (sale: any) => apiClient.put('sales.php', sale),
    delete: (id: number) => apiClient.delete(`sales.php?id=${id}`),
};

// Recycle Bin API
export const recycleBinAPI = {
    getAll: () => apiClient.get('recyclebin.php'),
    restore: (id: number, type: string) => 
        apiClient.post('recyclebin.php', { action: 'restore', id, type }),
    permanentDelete: (id: number, type: string) => 
        apiClient.post('recyclebin.php', { action: 'permanent_delete', id, type }),
};

export default apiClient;
