import type { SVGProps } from 'react';

export function MusealyticsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 11l5-5 5 5" />
      <path d="M13 11l5-5 5 5" />
      <path d="M8 6v12c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
