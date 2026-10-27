export default function AlpayLogo({ className = 'h-10 w-10' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label="Alpay Logo"
    >
      <rect x="20" y="20" width="216" height="216" rx="56" fill="#0f172a" />
      <rect
        x="64"
        y="64"
        width="128"
        height="128"
        rx="28"
        fill="none"
        stroke="#ffffff"
        strokeWidth="18"
        strokeLinejoin="round"
      />
      <path d="M 128 88 L 162 152 H 140 L 128 130 L 116 152 H 94 Z" fill="#d8f53b" />
      <rect x="120" y="116" width="16" height="16" rx="4" fill="#0f172a" />
    </svg>
  );
}
