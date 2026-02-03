import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Category, MoneyLedgerState, Transaction } from './types';
import { DEFAULT_CATEGORIES } from './types';
import { supabase } from '../lib/supabase';

interface MoneyLedgerContextType extends MoneyLedgerState {
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => void;
    deleteCategory: (id: string) => void;
    loading: boolean;
}

const MoneyLedgerContext = createContext<MoneyLedgerContextType | undefined>(undefined);

export function MoneyLedgerProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<MoneyLedgerState>({
        transactions: [],
        categories: DEFAULT_CATEGORIES
    });
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            if (transactions) {
                const mappedTransactions: Transaction[] = transactions.map((t: any) => ({
                    id: t.id,
                    amount: t.amount,
                    type: t.type,
                    description: t.description,
                    date: t.date,
                    categoryId: t.category_id // Map snake_case to camelCase
                }));

                setData(prev => ({
                    ...prev,
                    transactions: mappedTransactions
                }));
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

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

    // Categories are still local/static for now as per plan
    const addCategory = (input: Omit<Category, 'id'>) => {
        const newCategory: Category = {
            ...input,
            id: crypto.randomUUID(),
        };
        setData(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
    };

    const deleteCategory = (id: string) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c.id !== id)
        }));
    };

    return (
        <MoneyLedgerContext.Provider value={{
            ...data,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addCategory,
            deleteCategory,
            loading
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
