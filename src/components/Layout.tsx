import React from 'react';
import { LayoutDashboard, List, Wallet, Settings, BarChart3 } from 'lucide-react';

import { Button } from './ui/button';
import { MonthSelector } from './MonthSelector';
import { useMoneyLedger } from '../store/useStore';
import { translations } from '../lib/i18n';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'transactions' | 'settings' | 'statistics';
    onTabChange: (tab: 'dashboard' | 'transactions' | 'settings' | 'statistics') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    const { language } = useMoneyLedger();
    const t = translations[language];

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary md:mr-8 cursor-pointer" onClick={() => onTabChange('dashboard')}>
                        <Wallet className="h-6 w-6" />
                        <span className="hidden md:inline">MoneyLedger</span>
                    </div>

                    <div className="flex-1 flex justify-center md:justify-start">
                        {/* Only show month selector if not in settings, or maybe keep it? 
                            Ideally, settings don't need month context, but keeping it is harmless.
                            Let's keep it to minimize layout shift. */}
                        <MonthSelector />
                    </div>

                    <nav className="flex items-center gap-2 md:gap-4">
                        <Button
                            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                            onClick={() => onTabChange('dashboard')}
                            className="gap-2 px-3 md:px-4"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">{t.dashboard}</span>
                        </Button>
                        <Button
                            variant={activeTab === 'transactions' ? 'default' : 'ghost'}
                            onClick={() => onTabChange('transactions')}
                            className="gap-2 px-3 md:px-4"
                        >
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">{t.transactions}</span>
                        </Button>
                        <Button
                            variant={activeTab === 'statistics' ? 'default' : 'ghost'}
                            onClick={() => onTabChange('statistics')}
                            className="gap-2 px-3 md:px-4"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">{t.statistics}</span>
                        </Button>
                        <Button
                            variant={activeTab === 'settings' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => onTabChange('settings')}
                            title={t.settings}
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
