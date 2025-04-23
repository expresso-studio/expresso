import * as React from "react";
import { useEffect, useState } from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { CourseNameToLink } from "@/lib/constants";
import { CourseType, LessonLeft, LessonStatus, LessonType } from "@/lib/types";
import Lesson from "@/components/lesson";
import { outfit } from "@/app/fonts";
import CourseProgress from "./course-progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthUtils } from "@/hooks/useAuthUtils";

interface Props extends CourseType {
  status?: number;
}

export default function CourseFormat({
  id,
  icon,
  color,
  name,
  topics,
  status,
  lessons,
}: Props) {
  const { user, isAuthenticated, isLoading, error, refreshToken } =
    useAuthUtils();

  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);

  const Icon = icon;
  const rotates = [
    "-rotate-12",
    "rotate-6",
    "rotate-0",
    "rotate-6",
    "rotate-12",
  ];

  // State to store completed lessons data
  const [lessonsLeft, setLessonsLeft] = useState<LessonLeft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonsLeft = async () => {
      try {
        // Assume the course ID is available or can be derived
        const courseId = id;
        const userId = user?.sub;
        console.log(userId);

        const response = await fetch(
          `/api/course/lessons-left?userId=${userId}&courseId=${courseId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch lessons left");
        }

        const data = await response.json();
        console.log("data.lessonsLeft");
        console.log(data.lessonsLeft);
        setLessonsLeft(data.lessonsLeft);
      } catch (error) {
        console.error("Error fetching lessons left:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.sub) {
      fetchLessonsLeft();
    }
  }, [user?.sub]);

  const lessonsWithStatus: (LessonType & LessonStatus)[] = lessons.map(
    (lesson) => {
      // Check if this lesson is in the lessonsLeft array
      const isLessonLeft = lessonsLeft.find(
        (leftLesson) => leftLesson.lesson_name === lesson.name
      );

      // If the lesson is in lessonsLeft, it means it's not completed
      return {
        ...lesson,
        status: isLessonLeft !== undefined,
      };
    }
  );

  return (
    <PageFormat
      breadCrumbs={[
        { url: "/dashboard/learning", name: "learning" },
        { url: "/dashboard/learning", name: "courses" },
        { name: CourseNameToLink[name] },
      ]}
    >
      <div
        style={{ background: color }}
        className="w-full h-[100px] flex items-center justify-center rounded-md overflow-hidden"
      >
        <div className="flex gap-4">
          {rotates.map((rotate, i) => (
            <div key={i} className="text-white text-5xl">
              <Icon />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-8 justify-between">
        <div className="min-w-[400px] flex flex-col gap-8 p-8 bg-white/50 dark:bg-darkBurnt rounded-lg">
          <div>
            <Heading1 id="intro">{name}</Heading1>
            <div className="w-full flex gap-2 flex-wrap mt-2">
              {topics.map((topic) => (
                <div
                  key={topic}
                  style={{ background: color }}
                  className="rounded-full text-white px-2"
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
          {status !== undefined && status !== -1 && !loading ? (
            <CourseProgress status={status} color={color} />
          ) : (
            <Card className="animate-pulse flex flex-col gap-4 items-center justify-center">
              <CardHeader className="items-center pb-0">
                <div className="h-8 w-[120px] rounded-full bg-black/50 dark:bg-white/50"></div>
                <div className="h-4 w-[100px] rounded-full bg-stone-500/50"></div>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <div
                  className="w-[200px] h-[200px] rounded-full"
                  style={{ background: color }}
                ></div>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="h-4 w-[30px] rounded-full bg-stone-500/50"></div>
                <div className="h-4 w-[100px] rounded-full bg-stone-500/50"></div>
              </CardFooter>
            </Card>
          )}
        </div>
        <div className="w-full sm:mt-4">
          <div className="flex justify-between">
            <h2 className="font-bold text-xl" style={outfit.style}>
              Lessons
            </h2>
            <span className="text-sm">
              {lessons.length} lesson{lessons.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col p-4 bg-lightCoffee/10 dark:bg-black/75 rounded-lg">
            {loading ? (
              <>
                <LoadingLesson color={color} />
                <LoadingLesson color={color} />
                <LoadingLesson color={color} />
              </>
            ) : (
              lessonsWithStatus &&
              lessonsWithStatus.map((lesson) => (
                <Lesson
                  {...lesson}
                  color={color}
                  courseName={name}
                  key={lesson.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </PageFormat>
  );
}

interface loadingLessonProps {
  color: string;
}

const LoadingLesson = ({ color }: loadingLessonProps) => {
  return (
    <div className="animate-pulse flex gap-4 p-4 hover:bg-lightCream/50 dark:hover:bg-stone-900 rounded-md w-full">
      <div
        style={{ borderColor: color }}
        className={cn(
          `min-w-[55px] h-[55px] rounded-md overflow-hidden border bg-white dark:bg-darkGray`
        )}
      >
        <div
          style={{ color: color }}
          className="text-5xl h-8 w-8 grow rounded-lg -rotate-12 translate-x-2 translate-y-2 group-hover:-rotate-0 duration-300"
        ></div>
      </div>
      <div className="w-full">
        <div className="flex flex-col">
          <span
            className={
              "font-bold text-lg h-4 w-24 bg-black/50 dark:bg-white/50 rounded-full mb-2"
            }
          ></span>
          <div className="w-full flex gap-2">
            <div className="rounded-full bg-lightCaramel/50 text-white px-2 w-16 h-4"></div>
            <div className="rounded-full bg-lightCaramel/50 text-white px-2 w-16 h-4"></div>
          </div>
        </div>
      </div>
      <div className="max-h flex items-center justify-center text-2xl text-lightCoffee/50 rounded-full w-4 h-4"></div>
    </div>
  );
};
