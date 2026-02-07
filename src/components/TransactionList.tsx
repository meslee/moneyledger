import { useState, Fragment } from 'react';
import { useMoneyLedger } from '../store/useStore';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Placeholder for Input/Label if not created yet, I'll use standard HTML for now or standard tailwind classes
// Actually better to have UI components. I'll assume I create them or use raw HTML for now to save steps.
// I'll use raw HTML with tailwind classes for form elements to be faster, it's fine.

import { format } from 'date-fns';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { TransactionType } from '../store/types';
import { translations } from '../lib/i18n';

export function TransactionList() {
    // For now, I'll keep the initialization logic simple.

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        amount: '',
        description: '',
        date: '',
        categoryId: '',
        type: 'expense' as TransactionType
    });

    const { monthlyTransactions: transactions, categories, addTransaction, updateTransaction, deleteTransaction, language, dateFormat, formatMoney } = useMoneyLedger();
    const t = translations[language];

    const handleStartEdit = (t: any) => {
        setEditingId(t.id);
        setEditForm({
            amount: t.amount.toString(),
            description: t.description,
            date: format(new Date(t.date), 'yyyy-MM-dd'), // Input type="date" always needs yyyy-MM-dd
            categoryId: t.categoryId,
            type: t.type
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ amount: '', description: '', date: '', categoryId: '', type: 'expense' });
    };

    const handleUpdateTransaction = async () => {
        if (!editingId || !editForm.amount || !editForm.description || !editForm.categoryId) return;

        await updateTransaction({
            id: editingId,
            amount: Number(editForm.amount),
            description: editForm.description,
            date: new Date(editForm.date).toISOString(),
            categoryId: editForm.categoryId,
            type: editForm.type
        });

        setEditingId(null);
    };

    // Add Form State
    const [isAdding, setIsAdding] = useState(false);
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // Default to today
    const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

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

        setIsAdding(false);
        setAmount('');
        setDescription('');
    };

    const filteredCategories = categories.filter(c => c.type === type && c.isActive);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t.transactions}</h2>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? t.cancel : t.addTransaction}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/20 bg-muted/30">
                    <CardHeader>
                        <CardTitle>{t.addTransaction}</CardTitle>
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
                                    {t.expense}
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === 'income' ? 'default' : 'outline'}
                                    onClick={() => setType('income')}
                                    className="w-full shadow-none"
                                >
                                    {t.income}
                                </Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="amount" className="text-sm font-medium">{t.amount}</label>
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
                                    <label htmlFor="date" className="text-sm font-medium">{t.date}</label>
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
                                <label htmlFor="category" className="text-sm font-medium">{t.category}</label>
                                <select
                                    id="category"
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    required
                                >
                                    <option value="" disabled>{t.manageCategories}</option>
                                    {filteredCategories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">{t.description}</label>
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

                            <Button type="submit" className="w-full">{t.save}</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm table-fixed">
                            <colgroup>
                                <col className="w-[120px]" />
                                <col className="w-[150px]" />
                                <col className="w-auto" />
                                <col className="w-[150px]" />
                                <col className="w-[100px]" />
                            </colgroup>
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t.date}</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t.category}</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t.description}</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">{t.amount}</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {transactions.map((tItem) => {
                                    const category = categories.find(c => c.id === tItem.categoryId);
                                    const isEditing = editingId === tItem.id;

                                    return (
                                        <Fragment key={tItem.id}>
                                            <tr className="border-b transition-colors hover:bg-muted/50 group">
                                                <td className="p-4 align-middle">{format(new Date(tItem.date), dateFormat)}</td>
                                                <td className="p-4 align-middle">
                                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset" style={{ backgroundColor: category?.color + '20', color: category?.color, '--tw-ring-color': category?.color + '40' } as React.CSSProperties}>
                                                        {category?.name || t.uncategorized}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle">{tItem.description}</td>
                                                <div className={cn("ml-auto font-medium", tItem.type === 'income' ? "text-emerald-600" : "text-foreground")}>
                                                    {tItem.type === 'income' ? '+' : '-'}{formatMoney(tItem.amount)}
                                                </div>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleStartEdit(tItem)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => deleteTransaction(tItem.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isEditing && (
                                                <tr className="bg-muted/30 animate-in fade-in zoom-in-95">
                                                    <td className="p-4 align-middle">
                                                        <input
                                                            type="date"
                                                            value={editForm.date}
                                                            onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <select
                                                            value={editForm.categoryId}
                                                            onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })}
                                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        >
                                                            {categories.filter(c => c.type === editForm.type && c.isActive).map(c => (
                                                                <option key={c.id} value={c.id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <input
                                                            type="text"
                                                            value={editForm.description}
                                                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                            placeholder={t.description}
                                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <input
                                                            type="number"
                                                            value={editForm.amount}
                                                            onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                                                            placeholder={t.amount}
                                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="default" onClick={handleUpdateTransaction} className="h-8 w-8">
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">{t.noTransactions}</td>
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
