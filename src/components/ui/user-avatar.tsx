"use client";

import Image from "next/image";
import { useState } from "react";

interface UserAvatarProps {
  name: string;
  size?: number;
  className?: string;
  style?: string;
  seed?: string;
}

const DEFAULT_STYLE = "notionists-neutral";

export function getAvatarUrl(name: string, size: number, style?: string, seed?: string) {
  const avatarSeed = encodeURIComponent(seed || name || "Anonymous");
  return `https://api.dicebear.com/9.x/${style || DEFAULT_STYLE}/svg?seed=${avatarSeed}&size=${size}`;
}

export function UserAvatar({ name, size = 32, className = "", style, seed }: UserAvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const src = getAvatarUrl(name, size, style, seed);

  return (
    <div
      className={`relative rounded-full bg-muted shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {!loaded && (
        <div className="absolute inset-0 rounded-full bg-muted animate-pulse" />
      )}
      <Image
        src={src}
        alt={name || "Anonymous"}
        width={size}
        height={size}
        className={`rounded-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        unoptimized
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
