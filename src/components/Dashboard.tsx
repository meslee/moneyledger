import { useMemo } from 'react';
import { useMoneyLedger } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils'; // Make sure this import is correct based on your file structure

export function Dashboard() {
    const { transactions, categories } = useMoneyLedger();

    const summary = useMemo(() => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
        return {
            income,
            expense,
            balance: income - expense
        };
    }, [transactions]);

    const expenseByCategory = useMemo(() => {
        const expenseMap = new Map<string, number>();
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const current = expenseMap.get(t.categoryId) || 0;
                expenseMap.set(t.categoryId, current + t.amount);
            });

        return Array.from(expenseMap.entries())
            .map(([id, value]) => {
                const category = categories.find(c => c.id === id);
                return {
                    name: category?.name || 'Unknown',
                    value,
                    color: category?.color || '#cbd5e1'
                };
            })
            .sort((a, b) => b.value - a.value);
    }, [transactions, categories]);



    // Date formatter


    // Re-implement format for KRW context if needed. user's prompt was Korean.
    // I will use `style: 'currency', currency: 'KRW'` if I want to be localized.
    // But let's stick to generic number formatting to be safe? 
    // Let's use `Won` or just numbers.
    // I'll use standard local string in KR-locale.
    const formatMoney = (val: number) => val.toLocaleString('ko-KR');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMoney(summary.balance)} ₩</div>
                        <p className="text-xs text-muted-foreground">
                            Current net worth
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Income</CardTitle>
                        <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">+{formatMoney(summary.income)} ₩</div>
                        <p className="text-xs text-muted-foreground">
                            Total earnings
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                        <ArrowDownIcon className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">-{formatMoney(summary.expense)} ₩</div>
                        <p className="text-xs text-muted-foreground">
                            Total spending
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {transactions.slice(0, 5).map((t) => {
                                const category = categories.find(c => c.id === t.categoryId);
                                return (
                                    <div key={t.id} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full flex items-center justify-center border" style={{ backgroundColor: category?.color + '20', borderColor: category?.color }}>
                                            {/* Icon placeholder */}
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color }} />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{t.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {category?.name} • {format(new Date(t.date), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <div className={cn("ml-auto font-medium", t.type === 'income' ? "text-emerald-600" : "text-foreground")}>
                                            {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)} ₩
                                        </div>
                                    </div>
                                );
                            })}
                            {transactions.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">No transactions yet.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {expenseByCategory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expenseByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => `${formatMoney(value)} ₩`}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No expenses to display
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
