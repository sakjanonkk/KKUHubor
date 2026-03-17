export interface Course {
  id: number;
  code: string;
  nameTH: string;
  nameEN: string | null;
  facultyId: number | null;
  facultyNameTH: string | null;
  facultyNameEN: string | null;
  facultyColor?: string | null;
  description?: string | null;
  credit?: number | null;
  totalReactions?: number;
  reviewCount?: number;
  tags?: string[];
}

export interface SummaryFile {
  id: number;
  courseId: number;
  uploaderName: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  sessionId?: string;
  downloadCount: number;
  createdAt: Date;
}

export interface Review {
  id: number;
  courseId: number;
  reviewerName?: string;
  rating?: number;
  gradeReceived?: string;
  semester?: string;
  content: string;
  createdAt: Date;
  totalReactions?: number;
  reactionCounts?: Record<string, number>;
  sessionId?: string;
  avatarStyle?: string;
  avatarSeed?: string;
}

export interface ReviewCourseInfo {
  code: string;
  nameEN: string | null;
  nameTH: string;
}

export interface ReviewWithCourse extends Review {
  course: ReviewCourseInfo;
}
