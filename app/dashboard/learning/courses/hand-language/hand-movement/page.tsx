"use client";

import * as React from "react";
import { CourseNames, LessonNames, MetricNames } from "@/lib/constants";
import { LessonLeft, LessonType } from "@/lib/types";
import { Courses } from "@/lib/constants";
import LessonFormat from "../../../lesson-format";
import EvaluateButton from "@/components/evaluate-button";
import { useState } from "react";
import { useAuthUtils } from "@/hooks/useAuthUtils";

export default function Page() {
  const course = Courses.find(
    (course) => course.name === CourseNames.HandLanguage
  )!;

  const lessonObj = course.lessons.find(
    (lesson) => lesson.name === LessonNames.HandMovement
  )!;

  const [lessonData, setLessonData] = useState<
    LessonType & { status?: boolean }
  >(lessonObj);
  const { user, error, refreshToken } = useAuthUtils();

  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);

  React.useEffect(() => {
    const fetchLessonStatus = async () => {
      try {
        const selectedCourse = Courses.find(
          (course) => course.name === CourseNames.HandLanguage
        )!;

        const lesson = selectedCourse.lessons.find(
          (lesson) => lesson.name === LessonNames.HandMovement
        )!;

        // Fetch lesson status from the API
        const response = await fetch(
          `/api/course/lessons-left?userId=${user?.sub}&courseId=${selectedCourse.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch lesson status");
        }

        const data = await response.json();
        console.log(data);

        // Find this specific lesson's status
        const isLessonLeft = data.lessonsLeft.find(
          (leftLesson: LessonLeft) => leftLesson.lesson_name === lesson.name
        );

        // Set the lesson data with status
        setLessonData({
          ...lesson,
          status: isLessonLeft !== undefined,
        });
      } catch (error) {
        console.error("Error fetching lesson status:", error);
      }
    };

    if (user?.sub) {
      fetchLessonStatus();
    }
  }, [user?.sub]);

  if (!lessonData) {
    return (
      <main className="w-full min-h-full">
        <h1 className="text-4xl">Error: Could not find lesson.</h1>
      </main>
    );
  }

  return (
    <LessonFormat {...lessonData} courseName={course.name} color={course.color}>
      <div className="flex flex-col gap-8">
        <p className="mb-6">
          Hand gestures aren’t just expressive—they’re strategic. When used
          deliberately, they can elevate your presence, guide attention, and
          make your message memorable.
        </p>

        <div>
          {/* 🧠 Visual Table */}
          <h2 className="text-2xl font-semibold mb-4 text-lightCaramel">
            Motion Metrics Comparison
          </h2>

          <p className="mb-6">
            According to research, using hand motions in a controlled manner are
            correlated with better performances.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-lightCaramel shadow">
              <thead className="bg-lightCaramel text-white">
                <tr>
                  <th className="p-3 border">Type</th>
                  <th className="p-3 border">Motion</th>
                  <th className="p-3 border">Range (°)</th>
                  <th className="p-3 border">Frequency (per min)</th>
                  <th className="p-3 border">Effect</th>
                  <th className="p-3 border">PI</th>
                  <th className="p-3 border">CC</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border">
                  <td className="p-3 font-medium border">Hand Movement</td>
                  <td className="p-3 border">High Frequency</td>
                  <td className="p-3 border">38.4</td>
                  <td className="p-3 border">15.7</td>
                  <td className="p-3 border">Engaging, Dynamic Impression</td>
                  <td className="p-3 border text-green-600">↑ 0.54</td>
                  <td className="p-3 border text-green-600">↑ 0.47</td>
                </tr>
                <tr className="bg-lightLatte border">
                  <td className="p-3 font-medium border">Hand Movement</td>
                  <td className="p-3 border">Low Frequency</td>
                  <td className="p-3 border">29.4</td>
                  <td className="p-3 border">6.9</td>
                  <td className="p-3 border">Controlled Demeanor</td>
                  <td className="p-3 border">–</td>
                  <td className="p-3 border">–</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* 📐 Metric Explanation */}
        <div className="my-6 p-4 border-l-4 border-lightCaramel bg-lightLatte">
          <p>
            <strong>Note:</strong> “Degrees” refers to angular range captured
            through motion tracking, measuring how wide the hand gestures span.
            A higher degree suggests broader, more visible motions.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-lightCaramel">
            Takeways to Remember
          </h2>
          {/* 💡 Mnemonic */}
          <div className="mnemonic my-6 p-5 border-l-4 border-lightCaramel bg-lightLatte">
            <p className="font-semibold text-lg mb-2 text-lightCaramel">
              💡 "G.E.S.T.U.R.E." Model for Hand Gestures
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>G</strong>uide attention
              </li>
              <li>
                <strong>E</strong>mphasize key points
              </li>
              <li>
                <strong>S</strong>how scale or size
              </li>
              <li>
                <strong>T</strong>ell a story visually
              </li>
              <li>
                <strong>U</strong>nite with the audience
              </li>
              <li>
                <strong>R</strong>eflect your tone
              </li>
              <li>
                <strong>E</strong>nergize your delivery
              </li>
            </ul>
          </div>

          {/* 🧠 Expert Insight */}
          <blockquote className="italic border-l-4 pl-4 border-lightCaramel text-lightCoffee mt-6">
            “Purposeful gestures are those that emphasize your message—general
            movements, like fidgeting, don’t.” — Dr. Webster
          </blockquote>
          <p className="mt-3">
            <strong>Example:</strong> Pacing or twiddling your fingers is
            movement, not a gesture. But raising two fingers to signify “step
            two”? That’s a purposeful gesture.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-lightCaramel">
            Citations
          </h2>
          <ul className="list-disc ml-4">
            <li>
              The Annie E. Casey Foundation. (2024, October 22). The impact of
              social media and technology on Gen Alpha.
              https://www.aecf.org/blog/impact-of-social-media-on-gen-alpha
            </li>

            <li>
              Ding, X. (2024). The biomechanics of public speaking: Enhancing
              political communication and persuasion through posture and gesture
              analysis. Molecular & Cellular Biomechanics, 21(3), 566.
              https://doi.org/10.62617/mcb566
            </li>

            <li>
              Speak Sell Succeed. (2025, February 7). Purposeful hand gestures
              in public speaking & presentation. Speak Sell Succeed™. Retrieved
              April 17, 2025, from
              https://speaksellsucceed.com/purposeful-hand-gestures-in-public-speaking-presentation/
            </li>

            <li>
              Webster, S. Interview by C. Pei. [Video].
              https://drive.google.com/file/d/1Sziwu0rZIrFfCXyhKfFW0en6W4ewkcgM/view?usp=sharing
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full flex items-center justify-center pb-16">
        <EvaluateButton
          enabledParams={[MetricNames.HandMovement]}
          lessonId={lessonData.id}
        />
      </div>
    </LessonFormat>
  );
}
