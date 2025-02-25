
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
            <div className="fixed inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 transition-all duration-300 dark:bg-gray-800">
                <button onClick={onClose} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                    ✖
                </button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
                <div className="mt-4 flex justify-end gap-3">
                    <button className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
