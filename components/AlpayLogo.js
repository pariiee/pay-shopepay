export default function AlpayLogo({ className = 'h-10 w-10' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label="Alpay Logo"
      fill="none"
    >
      <rect x="0" y="0" width="256" height="256" rx="64" fill="#0f172a" />
      <rect
        x="48"
        y="48"
        width="160"
        height="160"
        rx="36"
        fill="none"
        stroke="#ffffff"
        strokeWidth="22"
        strokeLinejoin="round"
      />
      <path d="M 128 78 L 172 158 H 146 L 128 130 L 110 158 H 84 Z" fill="#d8f53b" />
      <rect x="119" y="115" width="18" height="18" rx="4" fill="#0f172a" />
    </svg>
  );
}
