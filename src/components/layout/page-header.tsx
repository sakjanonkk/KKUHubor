import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative py-12 md:py-16 overflow-hidden border-b border-border/40",
        className
      )}
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full opacity-50 dark:opacity-20 animate-in fade-in zoom-in duration-1000" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[80px] rounded-full opacity-30 dark:opacity-10" />
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col gap-2 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground/80 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-backwards">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
