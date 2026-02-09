import type { User } from '@supabase/supabase-js';
import type { Language } from '../lib/i18n';

export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    type: TransactionType;
    color?: string; // Hex code or tailwind class
    isActive: boolean;
}

export interface Transaction {
    id: string;
    date: string; // ISO date string
    amount: number;
    type: TransactionType;
    categoryId: string;
    description: string;
}

export type DateFormat = 'yyyy-MM-dd' | 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy. MM. dd.';

export type Currency = 'KRW' | 'USD' | 'AUD';

export interface Profile {
    id: string;
    language: Language;
    currency: Currency;
    date_format: DateFormat; // snake_case in DB
}

export interface MoneyLedgerState {
    user: User | null;
    transactions: Transaction[];
    categories: Category[];
    language: Language;
    dateFormat: DateFormat;
    currency: Currency;
}

export const DEFAULT_CATEGORIES: Category[] = [
    // Income
    { id: 'inc1', name: '급여', type: 'income', color: '#10b981', isActive: true }, // emerald
    { id: 'inc2', name: '용돈', type: 'income', color: '#3b82f6', isActive: true }, // blue
    { id: 'inc3', name: '기타 수입', type: 'income', color: '#6366f1', isActive: true }, // indigo

    // Expenses
    { id: 'exp1', name: '식품', type: 'expense', color: '#ef4444', isActive: true }, // red (Food)
    { id: 'exp2', name: '외식', type: 'expense', color: '#f97316', isActive: true }, // orange (Dining Out)
    { id: 'exp3', name: '교육', type: 'expense', color: '#f59e0b', isActive: true }, // amber (Education)
    { id: 'exp4', name: '헌금', type: 'expense', color: '#eab308', isActive: true }, // yellow (Offering)
    { id: 'exp5', name: '주거', type: 'expense', color: '#84cc16', isActive: true }, // lime (Housing)
    { id: 'exp6', name: '의류', type: 'expense', color: '#22c55e', isActive: true }, // green (Clothing)
    { id: 'exp7', name: '건강', type: 'expense', color: '#14b8a6', isActive: true }, // teal (Health)
    { id: 'exp8', name: '교통', type: 'expense', color: '#06b6d4', isActive: true }, // cyan (Transport)
    { id: 'exp9', name: '보험', type: 'expense', color: '#0ea5e9', isActive: true }, // sky (Insurance)
    { id: 'exp10', name: 'IT', type: 'expense', color: '#3b82f6', isActive: true }, // blue (IT)
    { id: 'exp11', name: '기부', type: 'expense', color: '#8b5cf6', isActive: true }, // violet (Donation)
    { id: 'exp12', name: '선물', type: 'expense', color: '#d946ef', isActive: true }, // fuchsia (Gift)
    { id: 'exp13', name: '애견', type: 'expense', color: '#ec4899', isActive: true }, // pink (Pet)
];

export const NEW_USER_CATEGORIES: Omit<Category, 'id'>[] = [
    // Income
    { name: 'Earnings', type: 'income', color: '#10b981', isActive: true },
    { name: 'Allowance', type: 'income', color: '#3b82f6', isActive: true },
    { name: 'Others', type: 'income', color: '#6366f1', isActive: true },

    // Expenses
    { name: 'Meals', type: 'expense', color: '#ef4444', isActive: true },
    { name: 'Drinks', type: 'expense', color: '#f97316', isActive: true },
    { name: 'Snack', type: 'expense', color: '#f59e0b', isActive: true },
    { name: 'Clothing', type: 'expense', color: '#22c55e', isActive: true },
    { name: 'Beauty', type: 'expense', color: '#d946ef', isActive: true },
    { name: 'Giving', type: 'expense', color: '#8b5cf6', isActive: true },
    { name: 'Transport', type: 'expense', color: '#06b6d4', isActive: true },
    { name: 'Others', type: 'expense', color: '#64748b', isActive: true },
];
