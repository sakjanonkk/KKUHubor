import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/8 blur-[140px] rounded-full opacity-50 dark:opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-blue-500/8 blur-[120px] rounded-full opacity-40 dark:opacity-15" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-violet-500/5 blur-[100px] rounded-full opacity-30 dark:opacity-10" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="max-w-lg mx-auto">
          {/* Mascot with glow */}
          <div className="mb-6 animate-in fade-in zoom-in duration-500">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
              <Image
                src="/mascot-no-results.png"
                alt="404"
                width={200}
                height={112}
                className="relative mx-auto drop-shadow-lg"
                priority
              />
            </div>
          </div>

          {/* 404 Text */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-backwards">
            <h1 className="text-[10rem] md:text-[12rem] font-black tracking-tighter leading-none bg-gradient-to-b from-foreground/80 via-foreground/40 to-foreground/10 bg-clip-text text-transparent mb-2 select-none">
              {t("title")}
            </h1>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t("heading")}
            </h2>

            <p className="text-muted-foreground text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
            <Button asChild size="lg" className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20">
              <Link href="/">
                <Home className="h-4 w-4" />
                {t("backHome")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 gap-2"
            >
              <Link href="/courses">
                <Search className="h-4 w-4" />
                {t("browseCourses")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
