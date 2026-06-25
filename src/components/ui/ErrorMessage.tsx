"use client";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({
  message = "Impossible de charger les données.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-cdm-blue text-white rounded-lg text-sm font-medium hover:bg-cdm-blue/90 transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
