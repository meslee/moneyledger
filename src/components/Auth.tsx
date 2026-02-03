import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wallet } from 'lucide-react';

export function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ text: 'Check your email for the confirmation link!', type: 'success' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 items-center text-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-2">
                        <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {mode === 'login' ? 'Welcome back' : 'Create an account'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to sign in to your account
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                required
                                minLength={6}
                            />
                        </div>

                        {message && (
                            <div className={`text-sm p-2 rounded ${message.type === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-emerald-500/15 text-emerald-600'}`}>
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                        </Button>

                        <div className="text-center text-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode(mode === 'login' ? 'signup' : 'login');
                                    setMessage(null);
                                }}
                                className="text-primary hover:underline"
                            >
                                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
