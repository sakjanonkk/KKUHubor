import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Facebook, Code2, Database, Globe, Heart } from "lucide-react";

const FRONTEND_TECH = [
  "Next.js 16",
  "React 19",
  "Tailwind CSS 4",
  "shadcn/ui",
  "TypeScript",
  "Zustand",
  "React Hook Form",
  "Zod",
];

const BACKEND_TECH = [
  "PostgreSQL",
  "Prisma 7",
  "next-intl",
  "bcrypt",
];

const INFRA_TECH = ["Docker", "Bun", "Traefik", "MinIO"];

export default async function AboutPage() {
  const t = await getTranslations("About");

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
        <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12 max-w-4xl">
        {/* Project Description */}
        <section>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t("projectDescription")}
          </p>
        </section>

        {/* Developer */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">{t("developer")}</h2>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Code2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">sakjanonkk</h3>
                <p className="text-muted-foreground text-sm">
                  Khon Kaen University
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Links */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">{t("links")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="https://github.com/sakjanonkk/KKUHubor"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="hover:border-primary/30 hover:shadow-md transition-all h-full cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
                    <Github className="h-6 w-6 text-white dark:text-zinc-900" />
                  </div>
                  <div>
                    <p className="font-semibold">{t("sourceCode")}</p>
                    <p className="text-sm text-muted-foreground">
                      github.com/sakjanonkk/KKUHubor
                    </p>
                  </div>
                </CardContent>
              </Card>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61587237188651"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="hover:border-blue-500/30 hover:shadow-md transition-all h-full cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <Facebook className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{t("facebookPage")}</p>
                    <p className="text-sm text-muted-foreground">
                      KKUHubor
                    </p>
                  </div>
                </CardContent>
              </Card>
            </a>
            <a
              href="https://www.tiktok.com/@huborstudy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="hover:border-primary/30 hover:shadow-md transition-all h-full cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center shrink-0">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.1a8.16 8.16 0 0 0 4.76 1.52v-3.4c-.86 0-1.7-.18-2.48-.53h-.01l.49.01Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">TikTok</p>
                    <p className="text-sm text-muted-foreground">
                      @huborstudy
                    </p>
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">{t("techStack")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4 text-blue-500" />
                  {t("frontend")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {FRONTEND_TECH.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <Database className="h-4 w-4 text-green-500" />
                  {t("backend")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {BACKEND_TECH.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <Code2 className="h-4 w-4 text-orange-500" />
                  {t("infrastructure")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {INFRA_TECH.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* GitHub CTA */}
        <section className="text-center py-8">
          <Button asChild size="lg" className="gap-2 rounded-full px-8">
            <a
              href="https://github.com/sakjanonkk/KKUHubor"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              {t("viewOnGitHub")}
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1">
            {t("madeWith")} <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
          </p>
        </section>
      </div>
    </main>
  );
}
