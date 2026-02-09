import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Category, MoneyLedgerState, Transaction, DateFormat, Currency } from './types';
import { DEFAULT_CATEGORIES, NEW_USER_CATEGORIES } from './types';
import { supabase } from '../lib/supabase';
import { addMonths, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';

import type { Language } from '../lib/i18n';
import { translations } from '../lib/i18n';

interface MoneyLedgerContextType extends MoneyLedgerState {
    monthlyTransactions: Transaction[];
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    nextMonth: () => void;
    prevMonth: () => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    loading: boolean;
    language: Language;
    setLanguage: (lang: Language) => void;
    dateFormat: DateFormat;
    setDateFormat: (format: DateFormat) => void;
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatMoney: (amount: number) => string;
}

const MoneyLedgerContext = createContext<MoneyLedgerContextType | undefined>(undefined);

export function MoneyLedgerProvider({ children }: { children: React.ReactNode }) {
    // Load language from localStorage or default to 'ko'
    const [language, setLanguageState] = useState<Language>(() => {
        return (localStorage.getItem('moneyledger_language') as Language) || 'ko';
    });

    const [dateFormat, setDateFormatState] = useState<DateFormat>(() => {
        return (localStorage.getItem('moneyledger_dateFormat') as DateFormat) || 'yyyy-MM-dd';
    });

    const [currency, setCurrencyState] = useState<Currency>(() => {
        return (localStorage.getItem('moneyledger_currency') as Currency) || 'KRW';
    });

    const updateProfile = async (updates: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').upsert({
                id: user.id,
                updated_at: new Date(),
                ...updates
            });
        }
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('moneyledger_language', lang);
        updateProfile({ language: lang });
    };

    const setDateFormat = (format: DateFormat) => {
        setDateFormatState(format);
        localStorage.setItem('moneyledger_dateFormat', format);
        updateProfile({ date_format: format });
    };

    const setCurrency = (curr: Currency) => {
        setCurrencyState(curr);
        localStorage.setItem('moneyledger_currency', curr);
        updateProfile({ currency: curr });
    };

    const formatMoney = (amount: number) => {
        let locale = 'en-US';
        if (currency === 'KRW') locale = 'ko-KR';
        if (currency === 'AUD') locale = 'en-AU';

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: currency === 'KRW' ? 0 : 2,
            maximumFractionDigits: currency === 'KRW' ? 0 : 2,
        }).format(amount);
    };

    const t = translations[language];

    const [data, setData] = useState<Omit<MoneyLedgerState, 'language' | 'dateFormat' | 'currency'>>({
        user: null,
        transactions: [],
        categories: [] // Initially empty, will fetch or default
    });
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Auth State Listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setData(prev => {
                if (prev.user?.id === session?.user?.id) return prev;
                return { ...prev, user: session?.user || null };
            });
            if (session?.user) {
                // If we have a user but no data, we might want to refetch?
                // But let's leave fetchData to handle the initial load 
                // and just rely on this for keeping user state in sync.
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Get user from session first for speed, then verify with getUser if needed?
            // Actually getUser is safe.
            const { data: { user } } = await supabase.auth.getUser();

            // Update user state immediately
            setData(prev => ({ ...prev, user: user || null }));

            if (!user) return; // Wait for auth, or handle redirect elsewhere

            // Parallel fetch for transactions and categories
            const [trxResponse, catResponse] = await Promise.all([
                supabase.from('transactions').select('*').order('date', { ascending: false }),
                supabase.from('categories').select('*').order('created_at', { ascending: true })
            ]);

            if (trxResponse.error) throw trxResponse.error;

            // Transactions mapping
            const mappedTransactions: Transaction[] = (trxResponse.data || []).map((t: any) => ({
                id: t.id,
                amount: t.amount,
                type: t.type,
                description: t.description,
                date: t.date,
                categoryId: t.category_id
            }));

            // Handle Categories
            let mappedCategories: Category[] = [];

            if (catResponse.error) {
                // If table doesn't exist or connection error, fall back gracefully
                console.warn('Error fetching categories (using defaults):', catResponse.error);
                mappedCategories = DEFAULT_CATEGORIES;
            } else {
                mappedCategories = (catResponse.data || []).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    color: c.color,
                    isActive: c.is_active ?? true // Default to true for legacy
                }));

                // Logic: If DB is empty, we MUST seed it (for both New and Legacy users)
                if (mappedCategories.length === 0) {
                    let seedSource: Omit<Category, 'id'>[] | Category[] = [];
                    let userType = '';

                    if (mappedTransactions.length === 0) {
                        // New User -> English Defaults
                        seedSource = NEW_USER_CATEGORIES;
                        userType = 'New';
                    } else {
                        // Legacy User -> Korean Defaults
                        seedSource = DEFAULT_CATEGORIES;
                        userType = 'Legacy';
                    }

                    // RACE CONDITION MITIGATION:
                    // In React Strict Mode (Dev), this effect runs twice in parallel.
                    // We wait a random small amount to desynchronize them, then check DB again.
                    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));

                    const { count } = await supabase
                        .from('categories')
                        .select('*', { count: 'exact', head: true });

                    if (count === 0) {
                        console.log(`${userType} user detected. Seeding categories to DB...`);

                        // Prepare payload: Strip 'id' if it exists (for DEFAULT_CATEGORIES) and add user_id
                        const seedPayload = seedSource.map((c: any) => {
                            const { id, ...rest } = c; // drop 'id' if present so DB generates UUID
                            return {
                                ...rest,
                                user_id: user.id
                            };
                        });

                        const { data: insertedCats, error: insertError } = await supabase
                            .from('categories')
                            .insert(seedPayload)
                            .select();

                        if (!insertError && insertedCats) {
                            mappedCategories = insertedCats.map((c: any) => ({
                                id: c.id,
                                name: c.name,
                                type: c.type,
                                color: c.color,
                                isActive: c.is_active ?? true
                            }));
                        } else {
                            console.error('Failed to seed categories:', insertError);
                            // Only fallback to local defaults if DB write strictly fails
                            mappedCategories = DEFAULT_CATEGORIES;
                            alert(t.categoryInitError);
                        }
                    } else {
                        // If count > 0, the "other" parallel request already seeded.
                        const { data: reFetchedCats } = await supabase
                            .from('categories')
                            .select('*')
                            .order('created_at', { ascending: true });

                        if (reFetchedCats) {
                            mappedCategories = reFetchedCats.map((c: any) => ({
                                id: c.id,
                                name: c.name,
                                type: c.type,
                                color: c.color,
                                isActive: c.is_active ?? true
                            }));
                        }
                    }
                }
            }

            if (mappedCategories.length === 0) {
                // Option: Insert defaults automatically?
                // Let's just set them in state for now, but mark them as "default" visually? Not needed.
                // Let's use DEFAULT_CATEGORIES as initial state if DB is empty.
                mappedCategories = DEFAULT_CATEGORIES;
            }

            // --- FETCH PROFILE SETTINGS ---
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                // Sync DB Profile to Local State
                if (profile.language) {
                    setLanguageState(profile.language as Language);
                    localStorage.setItem('moneyledger_language', profile.language);
                }
                if (profile.currency) {
                    setCurrencyState(profile.currency as Currency);
                    localStorage.setItem('moneyledger_currency', profile.currency);
                }
                if (profile.date_format) {
                    setDateFormatState(profile.date_format as DateFormat);
                    localStorage.setItem('moneyledger_dateFormat', profile.date_format);
                }
            } else {
                // If no profile exists, create one with current defaults (or local storage values)
                // This ensures we have a row to update later
                // We use upsert to be safe against race conditions
                await supabase.from('profiles').upsert({
                    id: user.id,
                    language: language, // use current state (from local storage defaults)
                    currency: currency,
                    date_format: dateFormat,
                    updated_at: new Date()
                });
            }

            setData({
                user,
                transactions: mappedTransactions,
                categories: mappedCategories
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const monthlyTransactions = useMemo(() => {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);

        return data.transactions.filter(t =>
            isWithinInterval(new Date(t.date), { start, end })
        );
    }, [data.transactions, selectedDate]);

    const nextMonth = () => setSelectedDate(prev => addMonths(prev, 1));
    const prevMonth = () => setSelectedDate(prev => subMonths(prev, 1));

    const addTransaction = async (input: Omit<Transaction, 'id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            const payload = {
                amount: input.amount,
                type: input.type,
                description: input.description,
                date: input.date,
                category_id: input.categoryId, // Map to snake_case for DB
                user_id: user.id,
            };

            const { data: inserted, error } = await supabase
                .from('transactions')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            if (inserted) {
                const newTransaction: Transaction = {
                    id: inserted.id,
                    amount: inserted.amount,
                    type: inserted.type,
                    description: inserted.description,
                    date: inserted.date,
                    categoryId: inserted.category_id
                };

                setData(prev => ({
                    ...prev,
                    transactions: [newTransaction, ...prev.transactions]
                }));
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    const updateTransaction = async (updated: Transaction) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .update({
                    amount: updated.amount,
                    type: updated.type,
                    category_id: updated.categoryId, // Map to snake_case
                    description: updated.description,
                    date: updated.date
                })
                .eq('id', updated.id);

            if (error) throw error;

            setData(prev => ({
                ...prev,
                transactions: prev.transactions.map(t => t.id === updated.id ? updated : t)
            }));
        } catch (error) {
            console.error('Error updating transaction:', error);
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setData(prev => ({
                ...prev,
                transactions: prev.transactions.filter(t => t.id !== id)
            }));
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const addCategory = async (input: Omit<Category, 'id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            // PREVENT DUPLICATES: Check both existing DB categories AND virtual defaults
            const exists = data.categories.some(
                c => c.name === input.name && c.type === input.type
            );

            if (exists) {
                // In a real app, we'd use a toast notification. For now, we'll log and return.
                // You might also want to alert, but alerts are intrusive.
                console.warn('Category already exists.');
                alert(t.categoryExists); // Simple feedback for the user
                return;
            }

            const payload = {
                name: input.name,
                type: input.type,
                color: input.color,
                is_active: input.isActive,
                user_id: user.id
            };

            const { data: inserted, error } = await supabase
                .from('categories')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            if (inserted) {
                const newCategory: Category = {
                    id: inserted.id,
                    name: inserted.name,
                    type: inserted.type,
                    color: inserted.color,
                    isActive: inserted.is_active
                };

                setData(prev => {
                    return {
                        ...prev,
                        categories: [...prev.categories, newCategory]
                    };
                });
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert(t.categoryAddError);
        }
    };

    const updateCategory = async (updated: Category) => {
        try {
            // Check for potential duplicates (excluding self)
            const exists = data.categories.some(
                c => c.name === updated.name && c.type === updated.type && c.id !== updated.id
            );

            if (exists) {
                alert(t.categoryNameExists);
                return;
            }

            const { error } = await supabase
                .from('categories')
                .update({
                    name: updated.name,
                    color: updated.color,
                    is_active: updated.isActive
                })
                .eq('id', updated.id);

            if (error) throw error;

            setData(prev => ({
                ...prev,
                categories: prev.categories.map(c => c.id === updated.id ? updated : c)
            }));
        } catch (error: any) {
            console.error('Error updating category:', error);
            alert(`${t.categoryUpdateError}: ${error.message || t.error}`);
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            // SAFEGUARD: Check if category is used in any transaction
            const isUsed = data.transactions.some(t => t.categoryId === id);
            if (isUsed) {
                alert(t.categoryDeleteHasTransactions);
                return;
            }

            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setData(prev => ({
                ...prev,
                categories: prev.categories.filter(c => c.id !== id)
            }));
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(t.categoryDeleteError);
        }
    };

    return (
        <MoneyLedgerContext.Provider value={{
            ...data,
            monthlyTransactions,
            selectedDate,
            setSelectedDate,
            nextMonth,
            prevMonth,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addCategory,
            updateCategory,
            deleteCategory,
            loading,
            language,
            setLanguage,
            dateFormat,
            setDateFormat,
            currency,
            setCurrency,
            formatMoney
        }}>
            {children}
        </MoneyLedgerContext.Provider>
    );
}

export function useMoneyLedger() {
    const context = useContext(MoneyLedgerContext);
    if (context === undefined) {
        throw new Error('useMoneyLedger must be used within a MoneyLedgerProvider');
    }
    return context;
}
