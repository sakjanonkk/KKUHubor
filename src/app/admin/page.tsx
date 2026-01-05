import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";
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

async function getAnalytics() {
  const totalReviewsQuery = `SELECT COUNT(*)::int as count FROM reviews`;
  const totalCommentsQuery = `SELECT COUNT(*)::int as count FROM comments`;
  const pendingRequestsQuery = `SELECT COUNT(*)::int as count FROM course_requests WHERE status = 'pending'`;
  const topCoursesQuery = `
    SELECT 
      c.name_th, 
      COUNT(r.review_id)::int as review_count 
    FROM courses c 
    JOIN reviews r ON c.course_id = r.course_id 
    GROUP BY c.course_id, c.name_th 
    ORDER BY review_count DESC 
    LIMIT 5
  `;

  const [totalReviews, totalComments, pendingRequests, topCourses] =
    await Promise.all([
      db.query(totalReviewsQuery),
      db.query(totalCommentsQuery),
      db.query(pendingRequestsQuery),
      db.query(topCoursesQuery),
    ]);

  return {
    totalReviews: totalReviews.rows[0]?.count || 0,
    totalComments: totalComments.rows[0]?.count || 0,
    pendingRequests: pendingRequests.rows[0]?.count || 0,
    topCourses: topCourses.rows,
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
  const analytics = await getAnalytics();
  const facultiesResult = await db.query(
    "SELECT faculty_id, name_th, name_en FROM faculties ORDER BY name_th"
  );
  const faculties = facultiesResult.rows;

  const topCourseName =
    analytics.topCourses.length > 0 ? analytics.topCourses[0].name_th : "N/A";

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalComments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
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
              Trending Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={topCourseName}>
              {topCourseName}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reported Reviews</TabsTrigger>
          <TabsTrigger value="courses">Course Management</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Review Content</TableHead>
                  <TableHead>Report Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No reports found.
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
      </Tabs>
    </div>
  );
}
