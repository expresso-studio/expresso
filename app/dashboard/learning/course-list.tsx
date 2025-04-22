import React from "react";
import Course from "@/components/course";
import { CourseStatus, CourseType } from "@/lib/types";

interface Props {
  courses: (CourseType & CourseStatus)[];
  short?: boolean;
}

const CourseList = React.memo<Props>(function CourseList({ courses, short }) {
  return (
    <div className="flex flex-col gap-2">
      {courses.map(
        (course, i) => (!short || i < 5) && <Course {...course} key={i} />,
      )}
    </div>
  );
});

export default CourseList;
