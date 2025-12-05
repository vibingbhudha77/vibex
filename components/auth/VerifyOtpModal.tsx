import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface VerifyOtpModalProps {
    isOpen: boolean;
    email: string;
    onSuccess: () => void;
    onClose: () => void;
}

const VerifyOtpModal: React.FC<VerifyOtpModalProps> = ({ isOpen, email, onSuccess, onClose }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'signup'
            });

            if (error) throw error;

            onSuccess();
        } catch (error: any) {
            setError(error.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[--color-bg-primary] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-[--color-text-primary] mb-2">Verify Your Email</h2>
                    <p className="text-[--color-text-secondary] mb-6">
                        We've sent a verification code to <strong>{email}</strong>. Please enter it below.
                    </p>

                    <form onSubmit={handleVerify} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-[--color-text-secondary] mb-1">
                                Verification Code
                            </label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-accent-primary] text-[--color-text-primary] text-center tracking-widest text-lg font-mono"
                                placeholder="123456"
                                maxLength={6}
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
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtpModal;
