import { useState } from 'react';
import { CategoryManager } from './CategoryManager';
import { cn } from '../lib/utils';
import { LayoutGrid, User, Settings as SettingsIcon, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useMoneyLedger } from '../store/useStore';
import { translations } from '../lib/i18n';
import { format } from 'date-fns';
import type { DateFormat } from '../store/types';

export function SettingsPage() {
    const { language, setLanguage, dateFormat, setDateFormat, currency, setCurrency, user } = useMoneyLedger();
    const t = translations[language];
    const [activeSetting, setActiveSetting] = useState<'general' | 'categories' | 'profile'>('general');

    const dateFormats: DateFormat[] = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy. MM. dd.'];
    const today = new Date();

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sidebar Navigation */}
            <aside className="md:w-64 flex-shrink-0 space-y-2">
                <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                    <Button
                        variant={activeSetting === 'general' ? 'secondary' : 'ghost'}
                        onClick={() => setActiveSetting('general')}
                        className={cn("justify-start", activeSetting === 'general' && "bg-secondary")}
                    >
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        {t.appSettings}
                    </Button>
                    <Button
                        variant={activeSetting === 'categories' ? 'secondary' : 'ghost'}
                        onClick={() => setActiveSetting('categories')}
                        className={cn("justify-start", activeSetting === 'categories' && "bg-secondary")}
                    >
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        {t.categories}
                    </Button>
                    {/* Placeholder for future features */}
                    <Button
                        variant={activeSetting === 'profile' ? 'secondary' : 'ghost'}
                        onClick={() => setActiveSetting('profile')}
                        className={cn("justify-start", activeSetting === 'profile' && "bg-secondary")}
                    >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </Button>
                </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    {activeSetting === 'general' && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium">{t.language}</h3>
                                    <p className="text-sm text-muted-foreground">{t.selectLanguage}</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        variant={language === 'en' ? 'default' : 'outline'}
                                        onClick={() => setLanguage('en')}
                                        className="w-32"
                                    >
                                        English
                                    </Button>
                                    <Button
                                        variant={language === 'ko' ? 'default' : 'outline'}
                                        onClick={() => setLanguage('ko')}
                                        className="w-32"
                                    >
                                        한국어
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t">
                                <div>
                                    <h3 className="text-lg font-medium">{t.dateFormat}</h3>
                                    <p className="text-sm text-muted-foreground">{t.dateFormatDesc}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {dateFormats.map((fmt) => (
                                        <Button
                                            key={fmt}
                                            variant={dateFormat === fmt ? 'default' : 'outline'}
                                            onClick={() => setDateFormat(fmt)}
                                            className={cn("justify-start font-normal", dateFormat === fmt && "font-medium")}
                                        >
                                            <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                            {format(today, fmt)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t">
                                <div>
                                    <h3 className="text-lg font-medium">{t.currency}</h3>
                                    <p className="text-sm text-muted-foreground">{t.currencyDesc}</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        variant={currency === 'KRW' ? 'default' : 'outline'}
                                        onClick={() => setCurrency('KRW')}
                                        className="w-32"
                                    >
                                        KRW (₩)
                                    </Button>
                                    <Button
                                        variant={currency === 'USD' ? 'default' : 'outline'}
                                        onClick={() => setCurrency('USD')}
                                        className="w-32"
                                    >
                                        USD ($)
                                    </Button>
                                    <Button
                                        variant={currency === 'AUD' ? 'default' : 'outline'}
                                        onClick={() => setCurrency('AUD')}
                                        className="w-32"
                                    >
                                        AUD (A$)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSetting === 'categories' && <CategoryManager />}
                    {activeSetting === 'profile' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Profile</h3>
                                <p className="text-sm text-muted-foreground">Manage your account settings.</p>
                            </div>
                            <div className="p-4 rounded-lg border bg-muted/50">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{user?.email || 'No email detected'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                User ID: {user?.id}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
