export interface PillButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}
export function PillButton({
  onClick,
  ariaLabel,
  children,
  className = "",
}: PillButtonProps) {
  return (
    <button
      type="button"
      className={`absolute w-8 h-8 bg-white border rounded-full shadow flex items-center justify-center text-gray-400 hover:text-blue-500 focus:outline-none ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
