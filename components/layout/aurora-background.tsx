"use client";
import { cn } from "@/lib/utils";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export const AuroraBackground = ({
  children,
  className,
  containerClassName,
  showRadialGradient = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  showRadialGradient?: boolean;
}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setCursorPosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, []);

  const { x, y } = cursorPosition;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-background w-full",
        containerClassName
      )}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("relative flex w-full", className)}>
        {children}

        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            background: showRadialGradient
              ? `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,38,112,.1), transparent 40%)`
              : "",
          }}
        />
      </div>
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          background: `radial-gradient(400px circle at ${x}px ${y}px, rgba(121,22,243,.1), transparent 40%)`,
        }}
      />
    </div>
  );
};
