import React from 'react';

interface AboutUsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/50 z-[2000] transition-opacity duration-300 opacity-100"
                aria-hidden="true"
            />
            <div
                className="fixed inset-0 z-[2010] flex items-end sm:items-center justify-center p-0 sm:p-4"
                role="dialog"
                aria-modal="true"
            >
                <div className="w-full max-w-lg bg-[--color-bg-primary] sm:rounded-2xl rounded-t-2xl shadow-2xl p-6 sm:p-8 space-y-6 modal-content-container transform translate-y-0">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-[--color-text-primary]">About Vibex</h2>

                        <div className="bg-gradient-to-r from-green-500 to-purple-600 p-6 rounded-xl text-white space-y-3">
                            <p className="text-xl font-bold">✨ Built by ONE person</p>
                            <p className="text-2xl font-extrabold">with ZERO CODE! 🚀</p>
                        </div>

                        <p className="text-lg text-[--color-text-secondary]">
                            Want to bring <span className="font-bold text-[--color-accent-primary]">YOUR idea</span> to reality?
                        </p>

                        <div className="bg-[--color-bg-tertiary] p-6 rounded-xl space-y-3">
                            <h3 className="text-2xl font-bold text-[--color-text-primary]">Join Nexion</h3>
                            <p className="text-sm font-semibold text-[--color-accent-secondary]">From Prompt to Production.</p>
                            <p className="text-sm text-[--color-text-secondary]">
                                Join our community and explore how to turn your ideas into reality using AI!
                            </p>
                        </div>

                        <a
                            href="https://chat.whatsapp.com/FuxWSadhhZ21IP81cbM4AV"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
                        >
                            <span className="mr-2">💬</span>
                            Join WhatsApp Group
                        </a>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-[--color-bg-tertiary] text-[--color-text-primary] font-semibold rounded-lg hover:bg-[--color-border] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
};

export default AboutUsModal;
