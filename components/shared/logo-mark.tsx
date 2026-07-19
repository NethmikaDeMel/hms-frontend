export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M6 17h4.2l2-5.5 3.2 11 2.6-7.5H26"
        stroke="white"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
