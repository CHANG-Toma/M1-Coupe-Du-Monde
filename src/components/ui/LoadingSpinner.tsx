interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Chargement..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="w-10 h-10 border-4 border-cdm-blue/20 border-t-cdm-blue rounded-full animate-spin" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
