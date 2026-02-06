import React from 'react';
import { LayoutDashboard, List, Wallet } from 'lucide-react';

import { Button } from './ui/button';
import { MonthSelector } from './MonthSelector';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'transactions';
    onTabChange: (tab: 'dashboard' | 'transactions') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary md:mr-8">
                        <Wallet className="h-6 w-6" />
                        <span className="hidden md:inline">MoneyLedger</span>
                    </div>

                    <div className="flex-1 flex justify-center md:justify-start">
                        <MonthSelector />
                    </div>

                    <nav className="flex items-center gap-2 md:gap-4">
                        <Button
                            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                            onClick={() => onTabChange('dashboard')}
                            className="gap-2 px-3 md:px-4"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Button>
                        <Button
                            variant={activeTab === 'transactions' ? 'default' : 'ghost'}
                            onClick={() => onTabChange('transactions')}
                            className="gap-2 px-3 md:px-4"
                        >
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">Transactions</span>
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
