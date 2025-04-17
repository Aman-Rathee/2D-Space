import { X } from "lucide-react";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    onConfirm?: () => void;
}

export default function AlertModal({
    isOpen,
    onClose,
    title = "Alert",
    message = "Are you sure?",
    confirmText = "OK",
    onConfirm,
}: AlertModalProps) {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 backdrop-blur-xs bg-background-700/70" onClick={onClose}></div>
            <div className="relative w-full max-w-md rounded-lg p-6 bg-background-800">
                <X strokeWidth={4} onClick={onClose} className="absolute right-3 top-3 cursor-pointer transition-colors text-background-500 hover:text-background-600" />
                <h2 className="text-lg font-bold">
                    {title}
                </h2>
                <p className="mt-2 text-foreground-100">{message}</p>
                <div className="mt-4 flex justify-end gap-3">
                    <button className="rounded-md border hover:bg-background-700 transition-colors cursor-pointer px-4 py-2 text-sm font-medium" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="rounded-md bg-destructive px-4 py-2 text-sm font-medium cursor-pointer transition-colors text-white hover:bg-red-700"
                        onClick={() => {
                            onConfirm?.();
                            onClose();
                        }}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
