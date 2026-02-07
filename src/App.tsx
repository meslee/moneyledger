import { useEffect, useState } from 'react';
import { MoneyLedgerProvider } from './store/useStore';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

import { SettingsPage } from './components/SettingsPage';
import { StatisticsPage } from './components/StatisticsPage';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'settings' | 'statistics'>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <MoneyLedgerProvider key={session.user.id}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'transactions' && <TransactionList />}
        {activeTab === 'statistics' && <StatisticsPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </Layout>
    </MoneyLedgerProvider>
  );
}

export default App;
