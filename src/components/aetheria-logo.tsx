import * as React from 'react';

export function AetheriaLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="128"
      height="32"
      viewBox="0 0 128 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        fill="hsl(var(--primary))"
        xmlSpace="preserve"
        style={{ whiteSpace: 'pre' }}
        fontFamily="Inter, sans-serif"
        fontSize="24"
        fontWeight="bold"
        letterSpacing="0.05em"
      >
        <tspan x="0" y="23">
          Aetheria
        </tspan>
      </text>
    </svg>
  );
}
