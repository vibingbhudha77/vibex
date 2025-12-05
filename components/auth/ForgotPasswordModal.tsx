import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!isOpen) return null;

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!email) {
            setMessage({ type: 'error', text: 'Please enter your email address.' });
            setLoading(false);
            return;
        }

        if (!email.endsWith('@iitgn.ac.in')) {
            setMessage({ type: 'error', text: 'Please use your IITGN email address.' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Password reset link sent! Check your email.'
            });
            setTimeout(() => {
                onClose();
                setMessage(null);
                setEmail('');
            }, 3000);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to send reset link.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[--color-bg-primary] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[--color-text-primary]">Reset Password</h2>
                        <button
                            onClick={onClose}
                            className="text-[--color-text-tertiary] hover:text-[--color-text-primary] transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-[--color-text-secondary] mb-6">
                        Enter your IITGN email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-medium text-[--color-text-secondary] mb-1">
                                Email Address
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-accent-primary] text-[--color-text-primary]"
                                placeholder="you@iitgn.ac.in"
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-[--color-text-secondary] bg-[--color-bg-secondary] hover:bg-[--color-border] rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-[--color-accent-primary] hover:bg-[--color-accent-primary-hover] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Link'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
