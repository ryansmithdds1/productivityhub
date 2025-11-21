'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                } ${type === 'success'
                    ? 'bg-gray-900 border-green-500/50 text-green-400'
                    : 'bg-gray-900 border-red-500/50 text-red-400'
                }`}
            style={{ zIndex: 100 }}
        >
            {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <p className="text-sm font-medium text-white">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-2 text-gray-500 hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
}
