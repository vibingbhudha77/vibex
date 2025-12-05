import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Logo from '../common/Logo';

interface UpdatePasswordProps {
    onSuccess: () => void;
}

const UpdatePassword: React.FC<UpdatePasswordProps> = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;

            onSuccess();
        } catch (error: any) {
            setError(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[--color-bg-secondary] p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-[--color-bg-primary] rounded-2xl shadow-lg">
                <Logo />
                <h2 className="text-2xl font-bold text-center text-[--color-text-primary]">Set New Password</h2>
                <p className="text-center text-[--color-text-secondary]">
                    Please enter your new password below.
                </p>

                <form className="space-y-6" onSubmit={handleUpdatePassword}>
                    {error && <p className="text-[--color-error] text-sm text-center">{error}</p>}

                    <div>
                        <label htmlFor="new-password" className="text-sm font-medium text-[--color-text-secondary]">New Password</label>
                        <input
                            id="new-password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg shadow-sm text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-accent-primary]"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="text-sm font-medium text-[--color-text-secondary]">Confirm Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg shadow-sm text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-accent-primary]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[--color-text-on-accent] bg-[--color-accent-primary] hover:bg-[--color-accent-primary-hover] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-accent-primary] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;
