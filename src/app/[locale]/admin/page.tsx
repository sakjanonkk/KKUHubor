import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogoutButton } from "@/components/features/admin/logout-button";
import { ReportRow } from "./report-row";
import { CourseManagement } from "@/components/features/admin/course-management";
import { TagRequestManagement } from "@/components/features/admin/tag-request-management";
import { AnalyticsCharts } from "@/components/features/admin/analytics-charts";
import { RecentActivity } from "@/components/features/admin/recent-activity";

async function getReports() {
  const query = `
    SELECT
      r.report_id,
      r.reason,
      r.created_at as report_date,
      rev.review_id,
      rev.content,
      rev.reviewer_name
    FROM reports r
    JOIN reviews rev ON r.review_id = rev.review_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
  `;
  const result = await db.query(query);
  return result.rows;
}

async function getPendingRequests() {
  const query = `SELECT * FROM course_requests WHERE status = 'pending' ORDER BY created_at ASC`;
  const result = await db.query(query);
  return result.rows;
}

async function getTagRequests() {
  const query = `
    SELECT 
      tr.request_id, 
      tr.tag_name, 
      tr.created_at, 
      c.name_th as course_name,
      c.course_code
    FROM tag_requests tr 
    JOIN courses c ON tr.course_id = c.course_id 
    WHERE tr.status = 'pending' 
    ORDER BY tr.created_at ASC
  `;
  const result = await db.query(query);
  return result.rows;
}

async function getAnalytics() {
  const totalReviewsQuery = `SELECT COUNT(*)::int as count FROM reviews`;
  const totalCommentsQuery = `SELECT COUNT(*)::int as count FROM comments`;
  const pendingRequestsQuery = `SELECT COUNT(*)::int as count FROM course_requests WHERE status = 'pending'`;
  const topCoursesQuery = `
    SELECT
      c.name_th,
      c.course_code,
      COUNT(r.review_id)::int as review_count
    FROM courses c
    JOIN reviews r ON c.course_id = r.course_id
    GROUP BY c.course_id, c.name_th, c.course_code
    ORDER BY review_count DESC
    LIMIT 5
  `;
  const reviewsPerDayQuery = `
    SELECT DATE(created_at)::text as day, COUNT(*)::int as count
    FROM reviews WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at) ORDER BY day ASC
  `;
  const totalLikesQuery = `SELECT COUNT(*)::int as count FROM review_likes`;
  const recentActivityQuery = `
    (SELECT 'review' as type, review_id as id, reviewer_name as actor, content, created_at FROM reviews ORDER BY created_at DESC LIMIT 5)
    UNION ALL
    (SELECT 'comment', comment_id, author_name, content, created_at FROM comments ORDER BY created_at DESC LIMIT 5)
    ORDER BY created_at DESC LIMIT 10
  `;

  const [totalReviews, totalComments, pendingRequests, topCourses, reviewsPerDay, totalLikes, recentActivity] =
    await Promise.all([
      db.query(totalReviewsQuery),
      db.query(totalCommentsQuery),
      db.query(pendingRequestsQuery),
      db.query(topCoursesQuery),
      db.query(reviewsPerDayQuery),
      db.query(totalLikesQuery),
      db.query(recentActivityQuery),
    ]);

  return {
    totalReviews: totalReviews.rows[0]?.count || 0,
    totalComments: totalComments.rows[0]?.count || 0,
    pendingRequests: pendingRequests.rows[0]?.count || 0,
    topCourses: topCourses.rows,
    reviewsPerDay: reviewsPerDay.rows,
    totalLikes: totalLikes.rows[0]?.count || 0,
    recentActivity: recentActivity.rows,
  };
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session) {
    redirect("/admin/login");
  }

  const reports = await getReports();
  const pendingRequests = await getPendingRequests();
  const tagRequests = await getTagRequests();
  const analytics = await getAnalytics();
  const facultiesResult = await db.query(
    "SELECT faculty_id, name_th, name_en FROM faculties ORDER BY name_th"
  );
  const faculties = facultiesResult.rows;
  const t = await getTranslations("Admin");

  const topCourseName =
    analytics.topCourses.length > 0 ? analytics.topCourses[0].name_th : "N/A";

  return (
    <div className="container mx-auto px-4 py-6 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
        <LogoutButton />
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalReviews")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalComments")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalComments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pendingRequests")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.pendingRequests}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("trendingCourse")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={topCourseName}>
              {topCourseName}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <AnalyticsCharts
        reviewsPerDay={analytics.reviewsPerDay}
        totalLikes={analytics.totalLikes}
        topCourses={analytics.topCourses}
        totalReviews={analytics.totalReviews}
        translations={{
          reviewsPerDay: t("reviewsPerDay"),
          totalLikes: t("totalLikes"),
          topCourses: t("topCoursesTitle"),
          reviews: t("reviewsUnit"),
          noData: t("noData"),
        }}
      />

      {/* Recent Activity */}
      <RecentActivity
        activities={analytics.recentActivity}
        translations={{
          title: t("recentActivity"),
          noActivity: t("noActivity"),
          review: t("activityReview"),
          comment: t("activityComment"),
          report: t("activityReport"),
        }}
      />

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">{t("tabReports")}</TabsTrigger>
          <TabsTrigger value="courses">{t("tabCourses")}</TabsTrigger>
          <TabsTrigger value="tags">{t("tabTags")}</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("reviewContent")}</TableHead>
                  <TableHead>{t("reportReason")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center h-24 text-muted-foreground"
                    >
                      {t("noReports")}
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <ReportRow key={report.report_id} report={report} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <CourseManagement requests={pendingRequests} faculties={faculties} />
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <TagRequestManagement requests={tagRequests} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
