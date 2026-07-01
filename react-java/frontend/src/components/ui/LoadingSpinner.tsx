interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Chargement..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="w-8 h-8 border-2 border-[#1e2840] border-t-[#4a7ef5] rounded-full animate-spin" />
      <p className="text-sm text-[#6b7a9e]">{message}</p>
    </div>
  );
}
