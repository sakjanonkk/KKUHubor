"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserIdentity } from "@/hooks/use-user-identity";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ReviewFormProps {
  courseId: number;
}

export function ReviewForm({ courseId }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("Review.Form");

  const { name: storedName } = useUserIdentity();

  const formSchema = z.object({
    reviewerName: z.string().optional(),
    rating: z
      .string()
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 5,
        {
          message: t("validation.rating"),
        }
      ),
    gradeReceived: z.string().optional(),
    semester: z.string().min(1, t("validation.semester")),
    content: z.string().min(10, t("validation.contentLength")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviewerName: storedName || "",
      rating: "5",
      gradeReceived: "",
      semester: "",
      content: "",
    },
  });

  // Update form default when storedName changes (e.g. initial load)
  useEffect(() => {
    if (storedName) {
      form.setValue("reviewerName", storedName);
    }
  }, [storedName, form]);

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          reviewer_name: values.reviewerName || "Anonymous",
          rating: Number(values.rating),
          grade_received: values.gradeReceived,
          semester: values.semester,
          content: values.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      toast.success(t("successToast"));
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(t("errorToast"));
      console.error(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("button")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reviewerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("nameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ratingLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectRating")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} {t("ratingSuffix")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeReceived"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("gradeLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["A", "B+", "B", "C+", "C", "D+", "D", "F", "W"].map(
                          (grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("semesterLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("semesterPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contentLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("contentPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {t("submit")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
