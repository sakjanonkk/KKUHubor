export interface Course {
  id: number;
  code: string;
  nameTH: string;
  nameEN: string;
  facultyId: number;
  facultyNameTH: string;
  facultyNameEN: string;
  facultyColor?: string;
  description?: string;
  credit?: number;
  avgRating?: number;
  reviewCount?: number;
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
