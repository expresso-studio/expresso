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
    (course) => course.name === CourseNames.BodyLanguage
  )!;

  const lessonObj = course.lessons.find(
    (lesson) => lesson.name === LessonNames.BodyMovement
  )!;

  const [lessonData, setLessonData] = useState<
    LessonType & { status?: boolean }
  >(lessonObj);
  const { user, error, refreshToken } = useAuthUtils();

  // If there’s an auth error, try to refresh the token
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
          (course) => course.name === CourseNames.BodyLanguage
        )!;

        const lesson = selectedCourse.lessons.find(
          (lesson) => lesson.name === LessonNames.BodyMovement
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

        // Find this specific lesson’s status
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
          Your body speaks even when you don’t. Learning how to use body
          movement and nonverbal cues intentionally can significantly improve
          how you’re perceived—both in person and online.
        </p>

        <div>
          {/* 🔍 Body Activity Table */}
          <h2 className="text-2xl font-semibold mb-4 text-lightCaramel">
            Body Activity Quality Guide
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-lightCaramel shadow">
              <thead className="bg-lightCaramel text-white">
                <tr>
                  <th className="p-3 border">Quality</th>
                  <th className="p-3 border">Examples</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border">
                  <td className="p-3 font-medium border">High Quality</td>
                  <td className="p-3 border">
                    Attending, Writing, Hand Raising
                  </td>
                </tr>
                <tr className="bg-lightLatte border">
                  <td className="p-3 font-medium border">Low Quality</td>
                  <td className="p-3 border">
                    Absent, On Phone, Texting, Looking Away
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {/* 🧠 Movement & Gestures */}
          <h2 className="text-2xl font-semibold mt-10 mb-4 text-lightCaramel">
            Body Movement & Gestures
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Meaningful gestures:</strong> Use intentional
              gestures—point, count with fingers, show palms.
            </li>
            <li>
              <strong>Environment matters:</strong>
              <ul className="list-disc pl-6 mt-1 space-y-1 text-lightCoffee">
                <li>
                  <strong>In-person:</strong> Match the space—larger rooms =
                  bigger gestures (from the shoulder).
                </li>
                <li>
                  <strong>Online:</strong> Smaller gestures, less emphasis on
                  hands.
                </li>
              </ul>
            </li>
            <li>
              <strong>Excessive body movement:</strong> Watch for unnecessary
              rocking or pacing.
            </li>
            <li>
              <strong>Use your arms:</strong> Don’t rely only on elbow
              motion—full arm gestures are more expressive.
            </li>
            <li>
              <strong>Hand symmetry:</strong> Not essential—natural variation
              looks more human.
            </li>
            <li>
              <strong>{"Avoid “weathercaster hands”:"}</strong> Diamond-shaped
              hands seem robotic. Keep it fluid.
            </li>
          </ul>
        </div>

        <div>
          {/* 🧠 Nonverbal Communication */}
          <h2 className="text-2xl font-semibold mb-4 text-lightCaramel">
            Nonverbal Communication Matters
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Facial expressions & eye contact:</strong> These build
              connection and trust.
            </li>
            <li>
              <strong>Vocal variety:</strong> Adjust pitch and rate to keep
              attention.
            </li>
            <li>
              <strong>Emotions are contagious:</strong> Let tone and facial
              expression lead the energy of the room.
            </li>
          </ul>
        </div>
        <div>
          {/* 🎯 Feedback & Tools */}
          <h2 className="text-2xl font-semibold mb-4 text-lightCaramel">
            Feedback & Improvement Strategies
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Track vocal volume:</strong> Identify dips or surges to
              keep engagement consistent.
            </li>
            <li>
              <strong>Compare tools:</strong> Unlike static PowerPoint feedback,
              this system adapts to live delivery styles.
            </li>
            <li>
              <strong>Reference Sunshine:</strong> Their research reinforces
              effective nonverbal behavior (and yay for staying connected!).
            </li>
          </ul>
        </div>

        <div>
          {/* ❓ Q&A Engagement */}
          <h2 className="text-2xl font-semibold mb-4 text-lightCaramel">
            Engaging in Q&A
          </h2>
          <p className="mb-6">
            Great communicators don’t just answer—they engage. During Q&A, focus
            on answering open-ended questions with clarity and connection.
            Future iterations of this platform may even pull from current
            research to model effective response strategies.
          </p>

          <blockquote className="italic border-l-4 pl-4 border-lightCaramel text-lightCoffee mt-6">
            “It’s not about moving more. It’s about moving with purpose.”
          </blockquote>
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
          enabledParams={[MetricNames.BodyMovement]}
          lessonId={lessonData.id}
        />
      </div>
    </LessonFormat>
  );
}
