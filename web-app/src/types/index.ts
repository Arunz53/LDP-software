export type UserRole =
    | 'lab-report'
    | 'data-entry'
    | 'transport'
    | 'accounts'
    | 'super-admin';

export interface User {
    id: number;
    username: string;
    email?: string;
    password: string;
    role: UserRole;
}

export type StateCode =
    | 'Tamil Nadu'
    | 'Kerala'
    | 'Karnataka'
    | 'Andhra Pradesh'
    | 'Telangana'
    | 'Maharashtra';

export interface Vendor {
    id: number;
    code: string;
    name: string;
    ownerName?: string;
    gstNumber?: string;
    mobileNumber?: string;
    whatsappNumber?: string;
    state: StateCode;
    pinCode?: string;
    city: string;
    address?: string;
}

export interface MilkType {
    id: number;
    name: string;
    hsnCode?: string;
}

export interface VehicleInfo {
    id: number;
    vehicleNumber: string;
    driverName: string;
    capacity?: string;
    driverMobile?: string;
    transportCompany?: string;
}

export type CompartmentSlot = 'Front' | 'Middle' | 'Back' | 'Average';

export interface PurchaseLine {
    id: string;
    compartment: CompartmentSlot;
    milkTypeId: number;
    kgQty: number;
    ltr: number;
    fat: number;
    clr: number;
    snf: number;
    temperature?: number;
    mbrt?: number;
    acidity?: number;
    cob?: number;
    alcohol?: number;
    adulteration?: number;
    sealNo?: number;
}

export type PurchaseStatus = 'Delivered' | 'Accepted' | 'Rejected';

export interface Purchase {
    id: number;
    invoiceNo: string;
    date: string;
    vendorId: number;
    state: StateCode;
    vehicleNumber: string;
    driverName: string;
    driverMobile?: string;
    status: PurchaseStatus;
    lines: PurchaseLine[];
}