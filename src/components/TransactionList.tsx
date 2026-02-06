import { useState } from 'react';
import { useMoneyLedger } from '../store/useStore';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Placeholder for Input/Label if not created yet, I'll use standard HTML for now or standard tailwind classes
// Actually better to have UI components. I'll assume I create them or use raw HTML for now to save steps.
// I'll use raw HTML with tailwind classes for form elements to be faster, it's fine.

import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import type { TransactionType } from '../store/types';

export function TransactionList() {
    const { monthlyTransactions: transactions, categories, addTransaction, deleteTransaction, selectedDate } = useMoneyLedger();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // Default to today if within selected month, otherwise 1st of selected month
    const [date, setDate] = useState(() => {
        const today = new Date();
        const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

        if (today >= start && today <= end) {
            return format(today, 'yyyy-MM-dd');
        }
        return format(start, 'yyyy-MM-dd');
    });

    // Update form date when selectedDate changes (optional, but good UX if user switches months while form is open)
    // Actually, maybe better not to force reset if user is typing. 
    // Let's just initialize it correctly when opening the form or component mount.
    // For now, I'll keep the initialization logic simple.

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description || !categoryId) return;

        addTransaction({
            type,
            amount: Number(amount),
            description,
            categoryId,
            date: new Date(date).toISOString(),
        });

        // Reset
        setIsAdding(false);
        setAmount('');
        setDescription('');
        // setCategoryId(''); // Keep category?
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : 'Add Transaction'}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/20 bg-muted/30">
                    <CardHeader>
                        <CardTitle>New {type === 'income' ? 'Income' : 'Expense'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={type === 'expense' ? 'default' : 'outline'}
                                    onClick={() => setType('expense')}
                                    className="w-full"
                                >
                                    Expense
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === 'income' ? 'default' : 'outline'}
                                    onClick={() => setType('income')}
                                    className="w-full shadow-none"
                                >
                                    Income
                                </Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                                    <input
                                        id="amount"
                                        type="number"
                                        placeholder="0"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="date" className="text-sm font-medium">Date</label>
                                    <input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium">Category</label>
                                <select
                                    id="category"
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    required
                                >
                                    <option value="" disabled>Select a category</option>
                                    {filteredCategories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">Description</label>
                                <input
                                    id="description"
                                    type="text"
                                    placeholder="Dinner, Taxi, Salary..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full">Save Transaction</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {transactions.map((t) => {
                                    const category = categories.find(c => c.id === t.categoryId);
                                    return (
                                        <tr key={t.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">{format(new Date(t.date), 'yyyy-MM-dd')}</td>
                                            <td className="p-4 align-middle">
                                                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset" style={{ backgroundColor: category?.color + '20', color: category?.color, '--tw-ring-color': category?.color + '40' } as React.CSSProperties}>
                                                    {category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">{t.description}</td>
                                            <td className={cn("p-4 align-middle text-right font-medium", t.type === 'income' ? 'text-emerald-600' : '')}>
                                                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('ko-KR')} ₩
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">No transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
