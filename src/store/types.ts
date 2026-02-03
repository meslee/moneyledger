export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    type: TransactionType;
    color?: string; // Hex code or tailwind class
}

export interface Transaction {
    id: string;
    date: string; // ISO date string
    amount: number;
    type: TransactionType;
    categoryId: string;
    description: string;
}

export interface MoneyLedgerState {
    transactions: Transaction[];
    categories: Category[];
}

export const DEFAULT_CATEGORIES: Category[] = [
    // Income
    { id: 'inc1', name: '급여', type: 'income', color: '#10b981' }, // emerald
    { id: 'inc2', name: '용돈', type: 'income', color: '#3b82f6' }, // blue
    { id: 'inc3', name: '기타 수입', type: 'income', color: '#6366f1' }, // indigo

    // Expenses
    { id: 'exp1', name: '식품', type: 'expense', color: '#ef4444' }, // red (Food)
    { id: 'exp2', name: '외식', type: 'expense', color: '#f97316' }, // orange (Dining Out)
    { id: 'exp3', name: '교육', type: 'expense', color: '#f59e0b' }, // amber (Education)
    { id: 'exp4', name: '헌금', type: 'expense', color: '#eab308' }, // yellow (Offering)
    { id: 'exp5', name: '주거', type: 'expense', color: '#84cc16' }, // lime (Housing)
    { id: 'exp6', name: '의류', type: 'expense', color: '#22c55e' }, // green (Clothing)
    { id: 'exp7', name: '건강', type: 'expense', color: '#14b8a6' }, // teal (Health)
    { id: 'exp8', name: '교통', type: 'expense', color: '#06b6d4' }, // cyan (Transport)
    { id: 'exp9', name: '보험', type: 'expense', color: '#0ea5e9' }, // sky (Insurance)
    { id: 'exp10', name: 'IT', type: 'expense', color: '#3b82f6' }, // blue (IT)
    { id: 'exp11', name: '기부', type: 'expense', color: '#8b5cf6' }, // violet (Donation)
    { id: 'exp12', name: '선물', type: 'expense', color: '#d946ef' }, // fuchsia (Gift)
    { id: 'exp13', name: '애견', type: 'expense', color: '#ec4899' }, // pink (Pet)
];
