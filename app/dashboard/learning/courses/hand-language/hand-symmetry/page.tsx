import * as React from "react";
import {
  CourseNames,
  CourseStatuses,
  LessonNames,
  LessonStatuses,
} from "@/lib/constants";
import {
  CourseStatus,
  CourseType,
  LessonStatus,
  LessonType,
} from "@/lib/types";
import { Courses } from "@/lib/constants";
import LessonFormat from "../../../lesson-format";
import EvaluateButton from "@/components/evaluate-button";

export default function Page() {
  // TODO(casey): replace with actual status
  const course: (CourseType & CourseStatus) | undefined = Courses.map(
    (course) => {
      const matchingCourse = CourseStatuses.find(
        (courseStatus) => courseStatus.name === course.name
      );

      if (matchingCourse) {
        return { ...course, ...matchingCourse };
      }

      return { ...course, status: 0 };
    }
  ).find((course) => course.name == CourseNames.HandLanguage);

  // TODO(casey): replace with actual status
  const lesson: (LessonType & LessonStatus) | undefined = course?.lessons
    .map((lesson) => {
      const matchingLesson = LessonStatuses.find(
        (lessonStatus) => lessonStatus.name === lesson.name
      );

      if (matchingLesson) {
        return { ...lesson, ...matchingLesson };
      }

      return { ...lesson, status: false };
    })
    .find((lesson) => lesson.name == LessonNames.HandSymmetry);

  if (course == null || lesson == null) {
    return (
      <main className="w-full min-h-full">
        <h1 className="text-4xl">Error: Could find lesson.</h1>
      </main>
    );
  }

  return (
    <LessonFormat {...lesson} courseName={course.name} color={course.color}>
      <p>
        {`Why do weather forecasters often hold their hands in a triangle and
        return them to the same position during their broadcasts? The answer
        lies in how this gesture helps maintain a baseline. By positioning their
        hands in a consistent shape—usually a triangle in front of their
        chest—it creates a stable starting point, which can keep their movements
        in check and prevent excessive or erratic gestures. This controlled,
        symmetrical posture helps anchor the speaker’s body language, allowing
        them to focus on their verbal communication without being distracted by
        uncontrolled physical movement. However, outside of the context of a
        weather broadcast, this repetitive, fixed hand position can come across
        as robotic or mechanical, lacking the natural fluidity we often
        associate with spontaneous communication.`}
      </p>
      <div className="w-full flex items-center justify-center">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/rvIkdZRqjbQ?si=xH_OtFVMAr1CLRbu"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="rounded-lg"
        />
      </div>
      <p>
        {` In the world of nonverbal communication, the importance of gesture goes
        beyond simply making the audience feel comfortable with controlled body
        movements. Hand gestures that are meaningful, like pointing at an object
        or showing the palm when counting, carry more weight than ensuring the
        symmetry of the gestures. When we think of a well-executed presentation,
        the impact is often tied to how purposeful and intentional the gestures
        are, not whether the left and right hands mirror each other perfectly.
        Excessive body movement, on the other hand, can become a distraction.
        When standing in front of an audience, especially in larger spaces, it’s
        better to use broad, purposeful gestures that come from the shoulders,
        rather than smaller, unnecessary movements that may seem less
        intentional or more nervous.`}
      </p>
      <p>
        {`Moreover, when considering gestures in a larger room or during an online
        presentation, the dynamics change. For example, the focus for online
        presentations should shift from hand gestures altogether, as the
        audience may not even see them, making them less impactful. In contrast,
        in face-to-face presentations, gestures originating from the shoulders
        and extending outwards can add energy to the presentation and help
        convey key points. Even in a larger room, avoiding unnecessary body
        rocking or fiddling with the hands can help maintain focus on the
        message, rather than on the speaker's nervous movements. Ultimately,
        gestures should enhance the message being delivered, acting as a tool to
        clarify and emphasize rather than a distraction or unnecessary tic.`}
      </p>
      <div className="w-full flex items-center justify-center pb-16">
        <EvaluateButton />
      </div>
    </LessonFormat>
  );
}
