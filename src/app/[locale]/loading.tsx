import Image from "next/image";

export default function Loading() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
        {/* Logo with pulse */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <Image
            src="/logo.png"
            alt="KKUHubor"
            width={80}
            height={80}
            className="relative animate-pulse"
            priority
          />
        </div>

        {/* Spinner */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </main>
  );
}
