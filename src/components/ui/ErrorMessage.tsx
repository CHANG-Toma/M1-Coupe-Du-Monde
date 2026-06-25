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
      <p className="text-[#6b7a9e] text-sm max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#131929] border border-[#1e2840] text-white rounded-lg text-sm hover:border-[#4a7ef5]/40 transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
