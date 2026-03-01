"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  return (
    <main className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-destructive/10 blur-[120px] rounded-full opacity-40 dark:opacity-15" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-orange-500/10 blur-[100px] rounded-full opacity-30 dark:opacity-10" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent">
            {t("title")}
          </h1>

          <p className="text-muted-foreground text-base md:text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            {t("description")}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full px-6 gap-2"
              onClick={() => reset()}
            >
              <RefreshCw className="h-4 w-4" />
              {t("retry")}
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-6 gap-2"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                {t("backHome")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
