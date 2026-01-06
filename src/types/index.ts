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
  avgRating?: number;
  reviewCount?: number;
  tags?: string[];
}

export interface Review {
  id: number;
  courseId: number;
  reviewerName?: string;
  rating: number;
  gradeReceived?: string;
  semester?: string;
  content: string;
  createdAt: Date;
  likeCount?: number;
}
