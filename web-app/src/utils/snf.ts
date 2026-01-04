import { StateCode } from '../types';

const snfMap: Record<StateCode, { fatFactor: number; constant: number }> = {
    'Tamil Nadu': { fatFactor: 0.2, constant: 0.36 },
    Kerala: { fatFactor: 0.2, constant: 0.5 },
    Karnataka: { fatFactor: 0.25, constant: 0.35 },
    'Andhra Pradesh': { fatFactor: 0.21, constant: 0.36 },
    Telangana: { fatFactor: 0.21, constant: 0.36 },
    Maharashtra: { fatFactor: 0.22, constant: 0.38 },
};

export const computeSnf = (state: StateCode, clr: number, fat: number): number => {
    const config = snfMap[state];
    return parseFloat(((clr / 4) + config.fatFactor * fat + config.constant).toFixed(2));
};

export const computeClr = (state: StateCode, snf: number, fat: number): number => {
    const config = snfMap[state];
    return parseFloat(((snf - config.fatFactor * fat - config.constant) * 4).toFixed(2));
};

export const formatNumber = (value: number | undefined, decimals = 2): string => {
    if (value === undefined || Number.isNaN(value)) return '';
    return Number(value).toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};
