"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusCircle, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const requestSchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  nameTH: z.string().min(1, "Thai name is required"),
  nameEN: z.string().optional(),
  facultyId: z.string().min(1, "Faculty is required"),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface Faculty {
  faculty_id: number;
  name_th: string;
}

export function CourseRequestDialog() {
  const [open, setOpen] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const t = useTranslations("CourseRequest");

  // Combobox state
  const [openCombobox, setOpenCombobox] = useState(false);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      courseCode: "",
      nameTH: "",
      nameEN: "",
      facultyId: "",
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    async function fetchFaculties() {
      setLoadingFaculties(true);
      try {
        const res = await fetch("/api/faculties");
        if (res.ok) {
          const data = await res.json();
          setFaculties(data);
        }
      } catch (error) {
        console.error("Failed to load faculties");
      } finally {
        setLoadingFaculties(false);
      }
    }
    fetchFaculties();
  }, []);

  async function onSubmit(data: RequestFormValues) {
    try {
      const payload = {
        ...data,
        facultyId: parseInt(data.facultyId),
      };

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      toast.success(t("successToast"));
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(t("errorToast"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-neutral-200 dark:border-neutral-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
        >
          <PlusCircle className="h-4 w-4" />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-none shadow-2xl bg-background/95 backdrop-blur-xl">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-grid-slate-200/[0.04] bg-[bottom_1px_center] align-bottom pointer-events-none -z-10" />
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 blur-[80px] rounded-full pointer-events-none -z-10" />

        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <PlusCircle className="h-6 w-6" />
            </div>
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground/80">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 px-6 pb-6"
          >
            <div className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="courseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      {t("courseCode")} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("courseCodePlaceholder")}
                        {...field}
                        className="h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30 text-lg font-mono tracking-wide"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameTH"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        {t("thaiName")} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("thaiNamePlaceholder")}
                          {...field}
                          className="h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameEN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        {t("englishName")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("englishNamePlaceholder")}
                          {...field}
                          className="h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="facultyId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-semibold">{t("faculty")} *</FormLabel>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className={cn(
                              "w-full justify-between h-11 bg-muted/30 border-muted-foreground/20 hover:border-primary/50",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? faculties.find(
                                (f) => f.faculty_id.toString() === field.value
                              )?.name_th
                              : t("selectFaculty")}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0 z-[9999]"
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder={t("searchFaculty")} />
                          <CommandList>
                            <CommandEmpty>{t("noFacultyFound")}</CommandEmpty>
                            <CommandGroup>
                              {faculties.map((faculty) => (
                                <CommandItem
                                  value={faculty.name_th}
                                  key={faculty.faculty_id}
                                  onSelect={() => {
                                    form.setValue(
                                      "facultyId",
                                      faculty.faculty_id.toString()
                                    );
                                    setOpenCombobox(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      faculty.faculty_id.toString() ===
                                        field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {faculty.name_th}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
              disabled={isSubmitting || loadingFaculties}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("submit")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
