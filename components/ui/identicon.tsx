"use client";

import React, { useMemo } from "react";
import { polkadotIcon } from "@polkadot/ui-shared";

interface IdenticonProps {
  address: string;
  size?: number;
  className?: string;
}

export function Identicon({ address, size = 32, className }: IdenticonProps) {
  const circles = useMemo(() => {
    try {
      return polkadotIcon(address, { isAlternative: false });
    } catch {
      return [];
    }
  }, [address]);

  if (circles.length === 0) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: "var(--muted)",
        }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={{ borderRadius: "50%" }}
    >
      {circles.map((circle, i) => (
        <circle
          key={i}
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
          fill={circle.fill}
        />
      ))}
    </svg>
  );
}
