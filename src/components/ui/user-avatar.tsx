import Image from "next/image";

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
  const src = getAvatarUrl(name, size, style, seed);

  return (
    <Image
      src={src}
      alt={name || "Anonymous"}
      width={size}
      height={size}
      className={`rounded-full bg-muted shrink-0 ${className}`}
      unoptimized
    />
  );
}
