import { getTranslations } from "next-intl/server";
import { CommunityFeed } from "@/components/features/community/community-feed";
import { MessageSquare } from "lucide-react";

export default async function CommunityPage() {
  const t = await getTranslations("Community");

  return (
    <main className="min-h-screen bg-background">
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/15 blur-[120px] rounded-full opacity-40 dark:opacity-15" />
        </div>

        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">{t("title")}</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              {t("description")}
            </p>
          </div>

          {/* Feed */}
          <CommunityFeed />
        </div>
      </section>
    </main>
  );
}
