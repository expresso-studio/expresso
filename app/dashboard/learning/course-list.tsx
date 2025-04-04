import React from "react";
import Course from "@/components/course";
import { Courses, CourseStatuses } from "@/lib/constants";

interface Props {
  short?: boolean;
}

const CourseList = React.memo<Props>(function CourseList({ short }) {
  const coursesWithStatus = Courses.map((course) => {
    const matchingCourse = CourseStatuses.find(
      (courseStatus) => courseStatus.name === course.name
    );

    if (matchingCourse) {
      return { ...course, ...matchingCourse };
    }

    return { ...course, status: 0 };
  });

  return (
    <div className="flex flex-col gap-2">
      {coursesWithStatus.map(
        (course, i) => (!short || i < 5) && <Course {...course} key={i} />
      )}
    </div>
  );
});

export default CourseList;
