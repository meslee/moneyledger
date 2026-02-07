import { useMemo, useState } from 'react';
import { useMoneyLedger } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { translations } from '../lib/i18n';

export function StatisticsPage() {
    const { transactions, categories, language, formatMoney, currency } = useMoneyLedger();
    const t = translations[language];
    const [range, setRange] = useState<6 | 12>(6);

    // Filter transactions for the selected range (last N months)
    const chartData = useMemo(() => {
        const today = new Date();
        const startDate = startOfMonth(subMonths(today, range - 1));
        const endDate = endOfMonth(today);

        // 1. Filter transactions by date range
        const filtered = transactions.filter(t =>
            isWithinInterval(parseISO(t.date), { start: startDate, end: endDate }) &&
            t.type === 'expense' // Focus on Expense trends for now, as usually that's what people analyze
        );

        // 2. Group by Month -> Category
        // Define a loose type for dynamic category keys
        const monthlyData = new Map<string, { [key: string]: string | number }>();

        // Initialize months
        for (let i = 0; i < range; i++) {
            const date = subMonths(today, range - 1 - i);
            const monthKey = format(date, 'yyyy-MM');
            monthlyData.set(monthKey, { date: monthKey });
        }

        filtered.forEach(t => {
            const monthKey = format(parseISO(t.date), 'yyyy-MM');
            const entry = monthlyData.get(monthKey);
            if (entry) {
                entry[t.categoryId] = ((entry[t.categoryId] as number) || 0) + t.amount;
            }
        });

        // 3. Convert to Array and add 'Total' for easy access
        return Array.from(monthlyData.values()).map(entry => {
            const total = Object.entries(entry)
                .filter(([key]) => key !== 'date')
                .reduce((sum, [, val]) => sum + (val as number), 0);
            return { ...entry, total: total as number };
        });
    }, [transactions, range]);

    // Comparison Analysis (Last Month vs Previous Month)
    const analysis = useMemo(() => {
        if (chartData.length < 2) return null;

        const thisMonth = chartData[chartData.length - 1] as any;
        const lastMonth = chartData[chartData.length - 2] as any;

        // Total Change
        const thisTotal = (thisMonth.total as number) || 0;
        const lastTotal = (lastMonth.total as number) || 0;

        const diff = thisTotal - lastTotal;
        const percent = lastTotal ? ((diff / lastTotal) * 100).toFixed(1) : (diff > 0 ? '100' : '0');

        // Top Mover (Category with biggest increase)
        let topMoverId = '';
        let maxIncrease = -Infinity;

        categories.forEach(cat => {
            const curr = (thisMonth[cat.id] as number) || 0;
            const prev = (lastMonth[cat.id] as number) || 0;
            const increase = curr - prev;
            if (increase > maxIncrease) {
                maxIncrease = increase;
                topMoverId = cat.id;
            }
        });

        const topMoverCategory = categories.find(c => c.id === topMoverId);

        return {
            diff,
            percent,
            topMover: topMoverCategory,
            topMoverAmount: maxIncrease
        };
    }, [chartData, categories]);

    // Custom Tooltip
    // Recharts types are tricky, using any for payload to avoid strict type issues with dynamic keys
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            // Sort payload by value desc
            const sorted = [...payload].sort((a: any, b: any) => (b.value as number) - (a.value as number));
            const total = sorted.reduce((sum, p: any) => sum + (p.value as number), 0);

            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                    <p className="font-semibold mb-2">{label}</p>
                    <div className="space-y-1">
                        {sorted.map((entry: any) => {
                            // Removing unused 'cat' variable
                            return (
                                <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="flex-1 text-muted-foreground">{entry.name}</span>
                                    <span className="font-medium">{formatMoney(entry.value)}</span>
                                </div>
                            );
                        })}
                        <div className="border-t pt-1 mt-1 flex justify-between font-bold text-sm">
                            <span>Total</span>
                            <span>{formatMoney(total)}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t.monthlyExpensesTrend}</h2>
                    <p className="text-muted-foreground">
                        {t.expenseHistoryDesc}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={range === 6 ? 'default' : 'outline'}
                        onClick={() => setRange(6)}
                        size="sm"
                    >
                        {t.last6Months}
                    </Button>
                    <Button
                        variant={range === 12 ? 'default' : 'outline'}
                        onClick={() => setRange(12)}
                        size="sm"
                    >
                        {t.last12Months}
                    </Button>
                </div>
            </div>

            {/* Analysis Cards */}
            {analysis && (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t.monthOverMonth}</CardTitle>
                            {analysis.diff > 0 ? (
                                <ArrowUpRight className="h-4 w-4 text-rose-500" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold", analysis.diff > 0 ? "text-rose-600" : "text-emerald-600")}>
                                {analysis.diff > 0 ? '+' : ''}{formatMoney(analysis.diff)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {Math.abs(Number(analysis.percent))}% {analysis.diff > 0 ? t.more : t.less} ({t.comparedToLastMonth})
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t.topMover} ({t.biggestIncrease})</CardTitle>
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analysis.topMover?.name || 'None'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t.increasedBy} {formatMoney(analysis.topMoverAmount)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.categoryBreakdown}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {t.categoryBreakdownDesc}
                    </p>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => {
                                    const date = parseISO(val + '-01');
                                    return language === 'en' ? format(date, 'MMM yyyy') : format(date, 'M월');
                                }}
                            />
                            <YAxis
                                tickFormatter={(val) => currency === 'KRW' ? `${(val / 10000).toFixed(0)}만` : `${val}`}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Legend iconType="circle" />
                            {categories
                                .filter(c => c.type === 'expense' && c.isActive)
                                .map(category => (
                                    <Bar
                                        key={category.id}
                                        dataKey={category.id}
                                        name={category.name}
                                        stackId="a"
                                        fill={category.color}
                                        radius={[0, 0, 0, 0]}
                                    />
                                ))}
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
