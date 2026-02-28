"use client";

import dynamic from "next/dynamic";

const Agentation =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("agentation").then((mod) => mod.Agentation), {
        ssr: false,
      })
    : () => null;

export function DevTools() {
  return <Agentation endpoint="http://localhost:4747" />;
}
