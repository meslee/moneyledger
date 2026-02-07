import { useState } from 'react';
import { useMoneyLedger } from '../store/useStore';
import { Button } from './ui/button';
import { Trash2, Plus } from 'lucide-react';
import type { TransactionType } from '../store/types';
import { translations } from '../lib/i18n';

export function CategoryManager() {
    const { categories, addCategory, updateCategory, deleteCategory, language } = useMoneyLedger();
    const t = translations[language];
    const [activeTab, setActiveTab] = useState<TransactionType>('expense');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#6366f1');
    const [isActive, setIsActive] = useState(true);

    const filteredCategories = categories.filter(c => c.type === activeTab);

    // Reset form
    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setName('');
        setColor('#6366f1');
        setIsActive(true);
    };

    const handleStartAdd = () => {
        resetForm();
        // Smart recommendation: Pick a color not used in this tab
        const usedColors = new Set(filteredCategories.map(c => c.color));
        const presetColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b'];
        const available = presetColors.find(c => !usedColors.has(c));
        if (available) setColor(available);

        setIsEditing(true);
    };

    const handleStartEdit = (category: any) => {
        setEditingId(category.id);
        setName(category.name);
        setColor(category.color || '#6366f1');
        setIsActive(category.isActive ?? true);
        setIsEditing(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        if (editingId) {
            // Update existing
            const existing = categories.find(c => c.id === editingId);
            if (existing) {
                await updateCategory({
                    ...existing,
                    name,
                    color,
                    isActive
                });
            }
        } else {
            // Add new
            await addCategory({
                name,
                type: activeTab,
                color,
                isActive
            });
        }

        resetForm();
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering edit
        if (confirm(t.confirmDelete)) {
            await deleteCategory(id);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{t.manageCategories}</h2>
                <p className="text-muted-foreground">
                    {t.manageCategoriesDesc}
                </p>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={activeTab === 'expense' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('expense')}
                    className="w-32"
                >
                    {t.expense}
                </Button>
                <Button
                    variant={activeTab === 'income' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('income')}
                    className="w-32"
                >
                    {t.income}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map(category => (
                    <div
                        key={category.id}
                        onClick={() => handleStartEdit(category)}
                        className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:cursor-pointer hover:border-primary/50 transition-all ${!category.isActive ? 'opacity-50 grayscale' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-background"
                                style={{ backgroundColor: category.color, '--tw-ring-color': category.color + '40' } as React.CSSProperties}
                            />
                            <div className="flex flex-col">
                                <span className="font-medium">{category.name}</span>
                                {!category.isActive && <span className="text-[10px] uppercase font-bold text-muted-foreground">Inactive</span>}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDelete(category.id, e)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                {isEditing ? (
                    <div className="col-span-full border rounded-lg bg-muted/30 p-4 animate-in fade-in zoom-in-95">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t.categoryName}</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="e.g., Groceries"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={isActive}
                                            onChange={e => setIsActive(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-muted-foreground">
                                            {t.isActiveDesc}
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.color}</label>
                                    <div className="flex gap-2 flex-wrap items-center">
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={e => setColor(e.target.value)}
                                                className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                                            />
                                        </div>
                                        {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b'].map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setColor(c)}
                                                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={resetForm}>{t.cancel}</Button>
                                <Button type="submit">{t.save}</Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        className="h-auto py-3 border-dashed hover:border-primary hover:bg-primary/5 flex flex-col gap-1 items-center justify-center text-muted-foreground hover:text-primary"
                        onClick={handleStartAdd}
                    >
                        <Plus className="h-6 w-6 mb-1" />
                        <span className="text-sm">{t.addCategory}</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
