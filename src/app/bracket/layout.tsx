import type { ReactNode } from "react";

export default function BracketLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative left-1/2 -translate-x-1/2 w-screen max-w-[1400px] px-2 sm:px-4">
      {children}
    </div>
  );
}
