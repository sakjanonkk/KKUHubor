"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CourseRequest {
  request_id: number;
  course_code: string;
  name_th: string;
  name_en?: string;
  faculty_id?: number;
  created_at: string;
}

interface Faculty {
  faculty_id: number;
  name_th: string;
  name_en?: string;
}

interface CourseManagementProps {
  requests: CourseRequest[];
  faculties: Faculty[];
}

export function CourseManagement({
  requests,
  faculties,
}: CourseManagementProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Add Course Form State
  const [newCourse, setNewCourse] = useState({
    courseCode: "",
    nameTH: "",
    nameEN: "",
    facultyId: "",
  });
  const [addingCourse, setAddingCourse] = useState(false);

  async function handleApprove(requestId: number) {
    setLoadingId(requestId);
    try {
      const res = await fetch("/api/admin/requests/approve", {
        method: "POST",
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Course approved and added.");
      router.refresh();
    } catch (e) {
      toast.error("Error approving request.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(requestId: number) {
    setLoadingId(requestId);
    try {
      const res = await fetch("/api/admin/requests/reject", {
        method: "POST",
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Request rejected.");
      router.refresh();
    } catch (e) {
      toast.error("Error rejecting request.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    setAddingCourse(true);
    try {
      const payload = {
        ...newCourse,
        facultyId: parseInt(newCourse.facultyId),
      };
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Course added successfully.");
      setNewCourse({ courseCode: "", nameTH: "", nameEN: "", facultyId: "" });
      router.refresh();
    } catch (e) {
      toast.error("Error adding course.");
    } finally {
      setAddingCourse(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Add Course Manually */}
      <Card>
        <CardHeader>
          <CardTitle>Add Course Manually</CardTitle>
          <CardDescription>
            Directly add a course to the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Course Code"
                value={newCourse.courseCode}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, courseCode: e.target.value })
                }
                required
              />
              <Select
                value={newCourse.facultyId}
                onValueChange={(val) =>
                  setNewCourse({ ...newCourse, facultyId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((f) => (
                    <SelectItem
                      key={f.faculty_id}
                      value={f.faculty_id.toString()}
                    >
                      {f.name_th}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Course Name (Thai)"
              value={newCourse.nameTH}
              onChange={(e) =>
                setNewCourse({ ...newCourse, nameTH: e.target.value })
              }
              required
            />
            <Input
              placeholder="Course Name (English)"
              value={newCourse.nameEN}
              onChange={(e) =>
                setNewCourse({ ...newCourse, nameEN: e.target.value })
              }
            />
            <Button type="submit" disabled={addingCourse} className="w-full">
              {addingCourse && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Course
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. Pending Requests */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>Review user-submitted courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground h-24"
                  >
                    No pending requests.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.request_id}>
                    <TableCell className="font-mono">
                      {req.course_code}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{req.name_th}</div>
                      <div className="text-xs text-muted-foreground">
                        {req.name_en}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(req.request_id)}
                          disabled={loadingId === req.request_id}
                        >
                          {loadingId === req.request_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(req.request_id)}
                          disabled={loadingId === req.request_id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
